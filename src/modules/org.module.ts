import { CordXSnowflake } from "@cordxapp/snowflake";
import { OrgMethod, Options } from "../types/modules/orgs"
import { Responses } from "../types/database"
import Logger from "../utils/logger.util"
import type CordX from "../client/bruhh"
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

    public get organization(): OrgMethod {
        return {
            /**
             * Create a new organization and assign the creator as the owner
             * @param opts - The options to create the organization
             * @returns The response from the database
             */
            create: async (opts: Options): Promise<Responses> => {
                const required = ['name', 'logo', 'banner', 'description', 'owner', 'api_key']
                const missing = required.filter((key) => !opts[key])

                if (missing.length > 0) return { success: false, message: `Missing required fields: ${missing.join(', ')}` };

                const user = await this.client.db.user.model.fetch(opts.owner as string);

                if (!user) return { success: false, message: 'You should log into our website/create an account before you do this!' };

                const org = await this.client.db.prisma.orgs.create({
                    data: {
                        id: this.snowflake.generate(),
                        name: opts.name as string,
                        logo: opts.logo as string,
                        banner: opts.banner as string,
                        description: opts.description as string,
                        owner: opts.owner as string,
                        api_key: randomBytes(16).toString('hex')
                    }
                }).catch((err: Error) => {
                    this.logs.error('Error creating org: ' + err.message);
                    this.logs.debug(err.stack as string);

                    return { success: false, message: `${err.message}` }
                })

                return { success: true, message: 'Organization created successfully!', data: org }
            }
        }
    }
}