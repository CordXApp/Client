import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { Responses } from "../../../types/database/index"
import { Create } from "../../../types/database/secrets";
import type CordX from "../../../client/cordx";


export class SecretClient {
    private client: CordX

    constructor(client: CordX) {
        this.client = client;
    }

    public get model() {
        return {
            /**
             * Create a new secret for the provided entity
             * @param opts - The options for creating a new secret
             * @param opts.entity - The entity to create the secret for
             * @param opts.userId - The user ID to create the secret for
             * @param opts.orgId - The organization ID to create the secret for
             * @param opts.maxUses - The maximum amount of times the secret can be used
             * @returns The response from the database
             */
            create: async (opts: Create): Promise<Responses> => {
                const secret = randomBytes(32).toString('hex');

                let update;
                let entityUpdate;
                const entity = opts.entity;

                switch (entity) {

                    case 'User': {
                        this.client.logs.info(`Creating a new ${entity} API Secret`);
                        update = await this.model.newSecret(secret, opts).catch((err: Error) => {
                            this.client.logs.debug(err.stack as string)
                            return { success: false, message: `${err.message}` }
                        });
                        entityUpdate = await this.client.db.prisma.users.update({
                            where: { id: opts.userId },
                            data: { secret: update.key }
                        })
                    }

                        break;

                    case 'Organization': {
                        this.client.logs.info(`Creating a new ${entity} API Secret`);
                        update = await this.model.newSecret(secret, opts).catch((err: Error) => {
                            this.client.logs.debug(err.stack as string)
                            return { success: false, message: `${err.message}` }
                        });
                        entityUpdate = await this.client.db.prisma.orgs.update({
                            where: { id: opts.orgId },
                            data: { secret: update.key }
                        })
                    }

                        break;

                    default: {
                        this.client.logs.info(`Creating a new ${entity} API Secret`);
                        update = await this.model.newSecret(secret, opts).catch((err: Error) => {
                            this.client.logs.debug(err.stack as string)
                            return { success: false, message: `${err.message}` }
                        });
                    }
                }

                if (!update) return { success: false, message: `Failed to create a new ${entity} API Secret` };
                if (entityUpdate && !entityUpdate) return { success: false, message: `Failed to update: ${entity} with the new API Secret` };

                return {
                    success: true,
                    message: `Here is your new ${entity} Secret!`,
                    data: {
                        id: update.id,
                        cornflake: opts.userId ? opts.userId : opts.orgId ? opts.orgId : null,
                        encrypted: update.key,
                        decrypted: secret,
                        maxUses: opts.maxUses,
                        entity: entity,
                    }
                }
            },
            view: async (id: string): Promise<Responses> => {

                const secret = await this.client.db.prisma.secrets.findUnique({ where: { id } });

                if (!secret) return { success: false, message: 'Unable to locate a secret with the provided Secret ID' };

                return {
                    success: true,
                    message: `The requested secret has been sent to your DM\'s for security purposes.`,
                    data: { secret: this.model.decrypt(secret.key) }
                }
            },
            list: async (): Promise<Responses> => {

                const secrets = await this.client.db.prisma.secrets.findMany();

                if (!secrets || secrets.length === 0) return { success: false, message: 'No secrets found in the database' };

                const data = secrets.map((secret: any) => {
                    return { id: secret.id }
                })

                return {
                    success: true,
                    message: 'Here are the ID\'s of all the secrets/admin keys saved in our database.',
                    data
                }
            },
            exists: async (key: string): Promise<Boolean> => {

                const secrets = await this.client.db.prisma.secrets.findMany();

                if (!secrets || secrets.length === 0) return false;

                const keys = secrets.map((secret: any) => this.model.decrypt(secret.key));

                if (keys.length === 0) return false;

                return keys.includes(key) ? true : false;
            },
            limited: async (key: string): Promise<boolean> => {
                const secrets = await this.client.db.prisma.secrets.findMany();

                const secret = secrets.find(secret => this.model.decrypt(secret.key) === key);

                if (!secret) {
                    throw new Error("Secret not found");
                }

                if (secret.uses >= (secret.maxUses ?? Infinity)) {
                    await this.client.db.prisma.secrets.update({
                        where: { id: secret.id },
                        data: { limited: true },
                    });

                    return true;
                }

                return false;
            },
            encrypt: (text: string): string => {
                const cipher = createCipheriv('aes-256-ctr', Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex'), Buffer.alloc(16, 0));
                const encrypted = Buffer.concat([cipher.update(Buffer.from(text, 'utf8')), cipher.final()]);
                return encrypted.toString('hex');
            },
            decrypt: (encryptedText: string): string => {
                const decipher = createDecipheriv('aes-256-ctr', Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex'), Buffer.alloc(16, 0));
                const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
                return decrypted.toString('utf8');
            },
            newSecret: async (secret: string, opts: Create): Promise<any> => {
                return await this.client.db.prisma.secrets.create({
                    data: {
                        key: this.model.encrypt(secret),
                        maxUses: opts.maxUses,
                        entity: opts.entity,
                        userId: opts.userId ? opts.userId : undefined,
                        orgId: opts.orgId ? opts.orgId : undefined
                    }
                }).catch((err: Error) => {
                    this.client.db.logs.error(`Failed to create secret for entity: ${opts.entity}`)
                    return this.client.db.logs.debug(`${err.stack}`);
                })
            }
        }
    }
}
