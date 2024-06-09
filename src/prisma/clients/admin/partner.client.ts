import { PartnerMethods, Responses } from "../../../types/database/index"
import { DatabaseClient } from "../../prisma.client";
import { Params } from "../../../types/database/partners";
import { Constructor } from "../../../types/database/clients";
import { Modules } from "../../../modules/base.module";
import Logger from "../../../utils/logger.util";
import type CordX from "../../../client/cordx";

export class PartnerClient {
    private client: CordX
    private logs: Logger;
    private db: DatabaseClient;
    private mods: Modules;

    constructor({ client, prisma, logs, mods }: Constructor) {
        this.client = client;
        this.db = prisma;
        this.logs = logs;
        this.mods = mods
    }

    public get model(): PartnerMethods {
        return {
            /**
             * Create a new partner
             * @param {Params} data - The data to create the partner with
             * @returns {Responses} - The response from the database
             */
            create: async (data: Params): Promise<Responses> => {

                const test = await this.db.prisma.partners.findFirst({ where: { name: data.name } });

                if (test) return { success: false, message: 'A partner with that name already exists' };

                const cornflake = await this.db.cornflake.generate();

                const partner = await this.db.prisma.partners.create({
                    data: {
                        id: cornflake,
                        name: data.name,
                        logo: data.logo,
                        banner: data.banner,
                        owner: data.owner,
                        about: data.about,
                        discord: data.discord,
                        website: data.website,
                        twitter: data.twitter
                    }
                })

                if (!partner) return {
                    success: false,
                    message: 'Error: unable to create partner.'
                }

                return {
                    success: true,
                    message: 'Here is the new partner info',
                    data: partner
                }
            }
        }
    }
}
