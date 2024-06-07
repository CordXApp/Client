import { WebhookMethods, Responses } from "../../../types/database/index"
import { Webhook } from "../../../types/database/webhooks";
import type CordX from "../../../client/cordx";


export class WebhookClient {
    private client: CordX

    constructor(client: CordX, prisma: any, logs: any) {
        this.client = client;
        
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

                const encrypted = await this.client.modules.security.init.encrypt(token).catch((err: Error) => {
                    this.client.db.logs.error(err.stack as string)
                    return { success: false, message: err.message }
                })

                console.log(encrypted)

                await this.client.db.prisma.webhooks.create({
                    data: {
                        id: id,
                        token: encrypted as string,
                        name: name,
                        enabled: true
                    }
                }).catch((err: Error) => {
                    this.client.db.logs.error(err.stack as string)
                    return { success: false, message: err.message }
                })

                return { success: true, message: `Webhook \`${name}\` created successfully` }
            },
            exists: async (id: Webhook['id']): Promise<Boolean> => {

                const webhook = await this.client.db.prisma.webhooks.findUnique({ where: { id } });

                if (!webhook) return false;

                return true
            },
            fetch: async (name: Webhook['name']): Promise<Responses> => {

                const webhook = await this.client.db.prisma.webhooks.findFirst({ where: { name: name } });

                if (!webhook) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                const partial = await this.client.modules.security.init.partial(webhook?.token).catch((err: Error) => {
                    this.client.db.logs.error(err.stack as any)
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

                const webhook = await this.client.db.prisma.webhooks.update({ where: { id }, data });

                return {
                    success: true,
                    message: 'Webhook updated successfully',
                    data: webhook
                }
            },
            delete: async (id: Webhook['id']): Promise<Responses> => {

                const check = await this.model.exists(id);

                if (!check) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                await this.client.db.prisma.webhooks.delete({ where: { id } });

                return { success: true, message: 'Webhook deleted successfully' }
            }
        }
    }
}
