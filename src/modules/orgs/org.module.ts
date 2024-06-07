import { CordXSnowflake } from "@cordxapp/snowflake";
import { Organizations, Options, AdminOpts } from "../../types/modules/orgs"
import { Responses } from "../../types/database"
import Logger from "../../utils/logger.util"
import type CordX from "../../client/cordx"

export class Organization {
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

    public get handler(): Organizations {
        return {
            /**
             * Create a new organization and assign the creator as the owner
             * @param opts - The options to create the organization
             * @returns The response from the database
             */
            create: async (opts: Options): Promise<Responses> => {
                const required = ['name', 'logo', 'banner', 'description', 'owner']
                const missing = required.filter((key) => !opts[key])
                const Cornflake = this.snowflake.generate();

                if (missing.length > 0) return { success: false, message: `Missing required fields: ${missing.join(', ')}` };

                if (opts.owner !== '510065483693817867' && opts.name?.includes('cordx') || opts.name?.includes('CordX')) return {
                    success: false,
                    message: 'Sorry chief, your organization name can not include "cordx" in any way, shape or form for obvious reasons :wink:'
                };

                const user = await this.client.db.user.model.fetch(opts.owner as string);

                if (!user) return {
                    success: false,
                    message: 'Organization owners should be members of our services!'
                };

                const test = await this.client.db.prisma.orgs.findFirst({ where: { name: opts.name as string } });

                if (test) return {
                    success: false,
                    message: 'An organization with that name already exists!'
                };

                const secret = await this.client.db.secret.model.create({
                    entity: 'Organization',
                    orgId: Cornflake,
                    maxUses: 5000
                })

                if (!secret || !secret.success) return secret;

                const org = await this.client.db.prisma.orgs.create({
                    data: {
                        id: Cornflake,
                        name: opts.name as string,
                        logo: opts.logo as string,
                        banner: opts.banner as string,
                        description: opts.description as string,
                        owner: opts.owner as string,
                        secret: secret.data.key,
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
            list: async (user: string): Promise<Responses> => {
                const orgs = await this.client.db.prisma.orgs.findMany({ where: { owner: user } });

                if (!orgs) return { success: false, message: 'Whoops, the provided user does not have any organizations!' };

                return { success: true, message: `Organizations for: ${user}`, data: orgs }
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
                        secret: opts.api_key as string,
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
}