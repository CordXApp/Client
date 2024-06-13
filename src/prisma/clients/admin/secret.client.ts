import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { DatabaseClient } from "../../prisma.client";
import { Constructor } from "../../../types/database/clients";
import { Modules } from "../../../modules/base.module";
import Logger from "../../../utils/logger.util";
import { PrismaClient } from '@prisma/client';
import { Responses } from "../../../types/database/index"
import { Create } from "../../../types/database/secrets";


export class SecretClient {
    private logs: Logger;
    private prisma: PrismaClient;
    private db: DatabaseClient;
    private mods: Modules;

    constructor(data: Constructor) {
        this.logs = data.logs;
        this.prisma = data.prisma;
        this.db = data.db;
        this.mods = data.mods;
    }

    public get model() {
        return {
            /**
             * Create a new secret for the provided entity
             * @param opts - The options for creating a new secret
             * @param opts.entity - The entity to create the secret for
             * @param opts.entityId - The Snowflake/Cornflake for the entity
             * @param opts.maxUses - The maximum amount of times the secret can be used
             * @returns The response from the database
             */
            create: async (opts: Create): Promise<Responses> => {
                const secret = randomBytes(32).toString('hex');

                let apikey;
                let update;
                const entity = opts.entity;

                switch (entity) {
                    case 'User':
                        this.logs.info(`Creating a new ${entity} API Secret!`);
                        apikey = await this.model.newSecret(secret, opts).catch((err: Error) => {
                            this.logs.error(`Error creating ${entity} secret: ${err.message}`)
                            this.logs.debug(err.stack as string)
                            return { success: false, message: err.message }
                        });
                        update = await this.db.prisma.users.update({
                            where: { id: opts.entityId },
                            data: { secret: apikey.key }
                        })
                        break;
                    case 'Organization':
                        this.logs.info(`Creating a new ${entity} API Secret!`);
                        apikey = await this.model.newSecret(secret, opts).catch((err: Error) => {
                            this.logs.error(`Error creating ${entity} secret: ${err.message}`)
                            this.logs.debug(err.stack as string)
                            return { success: false, message: err.message }
                        });
                        update = await this.db.prisma.orgs.update({
                            where: { id: opts.entityId },
                            data: { secret: apikey.key }
                        });
                        break;
                    default:
                        this.logs.info(`Creating a new ${entity} API Secret`);
                        update = await this.model.newSecret(secret, opts).catch((err: Error) => {
                            this.logs.debug(err.stack as string)
                            return { success: false, message: `${err.message}` }
                        });
                }

                if (!apikey) return { success: false, message: apikey.message };
                if (!update) return { success: false, message: `Failed to update: ${entity} with the new API Secret` };

                return {
                    success: true,
                    message: `Here is your new ${entity} Secret!`,
                    data: {
                        id: apikey.id,
                        cornflake: update.id,
                        encrypted: apikey.key,
                        decrypted: secret,
                        maxUses: apikey.maxUses,
                        entity: entity,
                    }
                }
            },
            view: async (id: string): Promise<Responses> => {

                const secret = await this.db.prisma.secrets.findUnique({ where: { id } });

                if (!secret) return { success: false, message: 'Unable to locate a secret with the provided Secret ID' };

                return {
                    success: true,
                    message: `The requested secret has been sent to your DM\'s for security purposes.`,
                    data: { secret: this.model.decrypt(secret.key) }
                }
            },
            list: async (): Promise<Responses> => {

                const secrets = await this.db.prisma.secrets.findMany();

                if (!secrets || secrets.length === 0) return { success: false, message: 'No secrets found in the database' };

                return {
                    success: true,
                    message: 'Here are the ID\'s of all the secrets/admin keys saved in our database.',
                    data: secrets
                }
            },
            exists: async (key: string): Promise<Boolean> => {

                const secrets = await this.db.prisma.secrets.findMany();

                if (!secrets || secrets.length === 0) return false;

                const keys = secrets.map((secret: any) => this.model.decrypt(secret.key));

                if (keys.length === 0) return false;

                return keys.includes(key) ? true : false;
            },
            limited: async (key: string): Promise<boolean> => {
                const secrets = await this.db.prisma.secrets.findMany();

                const secret = secrets.find(secret => this.model.decrypt(secret.key) === key);

                if (!secret) {
                    throw new Error("Secret not found");
                }

                if (secret.uses >= (secret.maxUses ?? Infinity)) {
                    await this.db.prisma.secrets.update({
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
                return await this.db.prisma.secrets.create({
                    data: {
                        key: this.model.encrypt(secret),
                        maxUses: opts.maxUses,
                        entity: opts.entity,
                        userId: opts.entity === 'User' ? opts.entityId : undefined,
                        orgId: opts.entity === 'Organization' ? opts.entityId : undefined
                    }
                }).catch((err: Error) => {
                    this.db.logs.error(`Failed to create secret for entity: ${opts.entity}`)
                    return this.db.logs.debug(`${err.stack}`);
                })
            }
        }
    }
}
