import { PartnerMethods, Responses } from "../../../types/database/index"
import { DatabaseClient } from "../../prisma.client";
import { Params } from "../../../types/database/partners";
import { Constructor } from "../../../types/database/clients";
import { Modules } from "../../../modules/base.module";
import { PrismaClient } from '@prisma/client';
import Logger from "../../../utils/logger.util";
import type CordX from "../../../client/cordx";

export class PartnerClient {
    private logs: Logger;
    private prisma: PrismaClient;
    private db: DatabaseClient;
    private mods: Modules;

    constructor(data: Constructor) {
        this.prisma = data.prisma;
        this.db = data.db;
        this.logs = data.logs;
        this.mods = data.mods
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
