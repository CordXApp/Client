import { WebhookMethods, Responses } from "../../../types/database/index"
import { Constructor } from "../../../types/database/clients";
import { Webhook } from "../../../types/database/webhooks";
import { Modules } from "../../../modules/base.module";
import { DatabaseClient } from "../../prisma.client";
import Logger from "../../../utils/logger.util";
import { PrismaClient } from '@prisma/client';
import type CordX from "../../../client/cordx";


export class WebhookClient {
    private client: CordX
    private logs: Logger;
    private db: DatabaseClient;
    private mods: Modules;

    constructor(data: Constructor) {
        this.client = data.client;
        this.db = data.prisma;
        this.logs = data.logs;
        this.mods = data.mods

    }

    public get model(): WebhookMethods {
        return {
            /**
             * Create a new webhook in the database (token is encrypted before saving)
             * @param {Webhook} data - The data to create the webhook with
             * @returns {Responses} - The response from the database
             */
            create: async ({ id, token, name }: Webhook): Promise<Responses> => {

                const check = await this.model.exists(id);

                if (check) return { success: false, message: 'Webhook already exists in our database.' };

                const encrypted = await this.mods.security.init.encrypt(token).catch((err: Error) => {
                    this.logs.error(err.stack as string)
                    return { success: false, message: err.message }
                })

                await this.db.prisma.webhooks.create({
                    data: {
                        id: id,
                        token: encrypted as string,
                        name: name,
                        enabled: true
                    }
                }).catch((err: Error) => {
                    this.logs.error(err.stack as string)
                    return { success: false, message: err.message }
                })

                return { success: true, message: `Webhook \`${name}\` created successfully` }
            },
            exists: async (id: Webhook['id']): Promise<Boolean> => {

                const webhook = await this.db.prisma.webhooks.findUnique({ where: { id } });

                if (!webhook) return false;

                return true
            },
            fetch: async (name: Webhook['name']): Promise<Responses> => {

                const webhook = await this.db.prisma.webhooks.findFirst({ where: { name: name } });

                if (!webhook) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                const partial = await this.db.modules.security.init.partial(webhook?.token).catch((err: Error) => {
                    this.logs.error(err.stack as any)
                    return { success: false, message: err.message }
                })

                const data = {
                    id: webhook.id,
                    token: partial as string,
                    name: webhook.name,
                    enabled: webhook.enabled
                }

                return { success: true, data }
            },
            update: async (id: Webhook['id'], data: Webhook): Promise<Responses> => {

                const check = await this.model.exists(id);

                if (!check) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                const webhook = await this.db.prisma.webhooks.update({ where: { id }, data });

                return {
                    success: true,
                    message: 'Webhook updated successfully',
                    data: webhook
                }
            },
            delete: async (id: Webhook['id']): Promise<Responses> => {

                const check = await this.model.exists(id);

                if (!check) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                await this.db.prisma.webhooks.delete({ where: { id } });

                return { success: true, message: 'Webhook deleted successfully' }
            }
        }
    }
}
