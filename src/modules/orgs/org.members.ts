import { CordXSnowflake } from "@cordxapp/snowflake";
import { OrganizationMembers, Members, Permissions } from "../../types/modules/orgs"
import type { ValidPerms } from "../../types/modules/orgs"
import { Responses } from "../../types/database"
import Logger from "../../utils/logger.util"
import type CordX from "../../client/cordx"

export class OrgMembers {
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

    public get handler(): OrganizationMembers {
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