import { CordXSnowflake } from "@cordxapp/snowflake";
import { Organizations, Options, AdminOpts, OrganizationMembers, Members, Permissions } from "../../types/modules/orgs"
import type { ValidPerms } from "../../types/modules/orgs"
import { Responses } from "../../types/database"
import Logger from "../../utils/logger.util"
import type CordX from "../../client/cordx"
import { randomBytes } from "crypto";

export class OrgModule {
    private client: CordX
    private snowflake: CordXSnowflake
    private logs: Logger

    constructor(client: CordX) {
        this.client = client
        this.logs = new Logger('Orgs')
        this.snowflake = new CordXSnowflake({
            workerId: 1,
            processId: 1,
            sequence: 5n,
            increment: 1,
            epoch: 1609459200000,
            debug: false
        })
    }

    public get organization(): Organizations {
        return {
            /**
             * Create a new organization and assign the creator as the owner
             * @param opts - The options to create the organization
             * @returns The response from the database
             */
            create: async (opts: Options): Promise<Responses> => {
                const required = ['name', 'logo', 'banner', 'description', 'owner']
                const missing = required.filter((key) => !opts[key])

                if (missing.length > 0) return { success: false, message: `Missing required fields: ${missing.join(', ')}` };

                if (opts.name?.includes('cordx') || opts.name?.includes('CordX')) return { success: false, message: 'Sorry chief, your organization name can not include "cordx" in any way, shape or form for obvious reasons :wink:' };

                const user = await this.client.db.user.model.fetch(opts.owner as string);

                if (!user) return { success: false, message: 'Organization owners should be members of our services!' };

                const test = await this.client.db.prisma.orgs.findFirst({ where: { name: opts.name as string } });

                if (test) return { success: false, message: 'An organization with that name already exists!' };

                const org = await this.client.db.prisma.orgs.create({
                    data: {
                        id: this.snowflake.generate(),
                        name: opts.name as string,
                        logo: opts.logo as string,
                        banner: opts.banner as string,
                        description: opts.description as string,
                        owner: opts.owner as string,
                        api_key: randomBytes(32).toString('hex'),
                    }
                }).catch((err: Error) => {
                    this.logs.error('Error creating org: ' + err.message);
                    this.logs.debug(err.stack as string);

                    return { success: false, message: `${err.message}` }
                })

                return { success: true, message: 'Organization created successfully!', data: org }
            },
            view: async (id: string): Promise<Responses> => {
                const org = await this.client.db.prisma.orgs.findUnique({
                    where: { id },
                    include: { members: true, links: true, domain: true }
                });

                if (!org) return { success: false, message: 'Organization not found!' };

                return { success: true, message: 'Organization fetched successfully!', data: org }
            },
            update: async (opts: Options): Promise<Responses> => {
                const required = ['id', 'name', 'logo', 'banner', 'description', 'owner', 'api_key']
                const missing = required.filter((key) => !opts[key])

                if (missing.length > 0) return { success: false, message: `Missing required fields: ${missing.join(', ')}` };

                const org = await this.client.db.prisma.orgs.update({
                    where: {
                        id: opts.id as string
                    },
                    data: {
                        name: opts.name as string,
                        logo: opts.logo as string,
                        banner: opts.banner as string,
                        description: opts.description as string,
                        owner: opts.owner as string,
                        api_key: opts.api_key as string,
                    }
                }).catch((err: Error) => {
                    this.logs.error('Error updating org: ' + err.message);
                    this.logs.debug(err.stack as string);

                    return { success: false, message: `${err.message}` }
                })

                return { success: true, message: 'Organization updated successfully!', data: org }
            },
            delete: async (id: string): Promise<Responses> => {
                const org = await this.client.db.prisma.orgs.delete({
                    where: {
                        id: id
                    }
                }).catch((err: Error) => {
                    this.logs.error('Error deleting org: ' + err.message);
                    this.logs.debug(err.stack as string);

                    return { success: false, message: `${err.message}` }
                })

                return { success: true, message: 'Organization deleted successfully!', data: org }
            },
            admin: async (opts: AdminOpts): Promise<Responses> => {

                if (!opts.id) return { success: false, message: 'Missing required field: id' };

                const org = await this.client.db.prisma.orgs.update({
                    where: {
                        id: opts.id
                    },
                    data: {
                        verified: opts.verified,
                        banned: opts.banned
                    }
                }).catch((err: Error) => {
                    this.logs.error('Error updating org: ' + err.message);
                    this.logs.debug(err.stack as string);

                    return { success: false, message: `${err.message}` }
                })

                if (!org) return { success: false, message: 'Failed to update organization' };

                return { success: true, message: 'Organization updated successfully!', data: org }
            },
        }
    }

    public get members(): OrganizationMembers {
        return {
            add: async (opts: Members): Promise<Responses> => {

                const user = await this.client.db.user.model.fetch(opts.userid);

                if (!user.success) return { success: false, message: 'Organization members should be members of our services!' };

                const org = await this.client.db.prisma.orgs.findUnique({
                    where: { id: opts.org },
                    include: {
                        members: true,
                        links: true
                    }
                })

                if (!org) return { success: false, message: 'Organization not found!' };

                if (org.members.find((m) => m.userid === opts.userid)) return { success: false, message: 'User is already a member of this organization!' };

                const member = await this.client.db.prisma.orgs.update({
                    where: { id: opts.org },
                    data: {
                        members: {
                            create: {
                                userid: opts.userid,
                            }
                        }
                    }
                })

                if (!member) return { success: false, message: 'Failed to add member to organization!' };

                return { success: true, message: 'Member added successfully!' }
            },
            view: async (org: string): Promise<Responses> => {

                const orgs = await this.client.db.prisma.orgs.findUnique({
                    where: { id: org },
                    include: { members: true }
                });

                if (!orgs) return { success: false, message: 'Organization not found!' };

                return { success: true, message: 'Organization members fetched successfully!', data: orgs.members }
            },
            remove: async (opts: Members): Promise<Responses> => {

                const org = await this.client.db.prisma.orgs.findUnique({
                    where: { id: opts.org as string },
                    include: { members: true, links: true }
                });

                if (!org) return { success: false, message: 'Organization not found!' };
                if (!org.members.find((m) => m.userid === opts.userid)) return { success: false, message: 'User is not a member of this organization!' };

                const member = await this.client.db.prisma.org_member.delete({
                    where: { id: opts.org, userid: opts.userid },
                })

                if (!member) return { success: false, message: 'Failed to remove member from organization!' };

                return { success: true, message: 'Member removed successfully!' }
            },
            updatePerms: async (org: string, user: string, perm: ValidPerms, executor: string): Promise<Responses> => {

                const orgs = await this.client.db.prisma.orgs.findUnique({
                    where: { id: org },
                    include: { members: true },
                });

                if (!orgs) return { success: false, message: 'Organization not found!' };

                const mod = orgs.members.find((m) => m.userid === executor);

                if (!mod) return { success: false, message: 'You are not a member of this organization!' };

                const perms = JSON.parse(mod.perms as string) as ValidPerms[];

                if (!this.members.hasPerms(perms, 'org_members.update')) return { success: false, message: 'You do not have permission to update member permissions!' }

                const member = orgs.members.find((m) => m.userid === user);

                if (!member) return { success: false, message: 'User is not a member of this organization!' };

                const updated = await this.client.db.prisma.org_member.update({
                    where: { id: org, userid: user },
                    data: {
                        perms: {
                            set: JSON.stringify([member.perms, perm])
                        }
                    }
                });

                if (!updated) return { success: false, message: 'Failed to update member permissions!' };

                return { success: true, message: 'Member permissions updated successfully!' }
            },
            getPerms: async (org: string, user: string): Promise<Responses> => {

                const orgs = await this.client.db.prisma.orgs.findUnique({
                    where: { id: org },
                    include: { members: true },
                });

                if (!orgs) return { success: false, message: 'Organization not found!' };

                const member = orgs.members.find((m) => m.userid === user);

                if (!member) return { success: false, message: 'User is not a member of this organization!' };

                return { success: true, message: 'Member permissions fetched successfully!', data: JSON.parse(member.perms as string) as ValidPerms[] }
            },
            hasPerms: (perms: ValidPerms[], perm: ValidPerms): boolean => {
                let perm_split = perm.split(".");
                if (perm_split.length < 2) perm_split = [perm, "*"];

                const namespace = perm_split[0] as Permissions['namespace'];
                const permission = perm_split[1] as Permissions['permission'];

                let has_perm: string[] | null = null;
                let has_negator: boolean = false;

                for (const user_perm of perms) {

                    if (user_perm === "global.*") return true;

                    let user_perm_split = user_perm.split(".");

                    if (user_perm_split.length < 2) user_perm_split = [user_perm, "*"];

                    let user_perm_namespace = user_perm_split[0] as Permissions['namespace'];
                    let user_perm_permission = user_perm_split[1] as Permissions['permission'];

                    if (user_perm.startsWith("~")) user_perm_namespace = user_perm_namespace.slice(1) as Permissions['namespace'];

                    if (
                        (user_perm_namespace === namespace ||
                            user_perm_namespace === "global" &&
                            (user_perm_permission === "*" || user_perm_permission === permission)
                        )
                    ) {
                        has_perm = user_perm_split;

                        if (user_perm.startsWith("~")) has_negator = true;
                    }
                }

                return has_perm !== null && !has_negator;
            }
        }
    }
}