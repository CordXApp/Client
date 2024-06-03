import { Responses } from "../../../types/database/index"
import type CordX from "../../../client/cordx";
import crypto from "node:crypto";


export class SecretClient {
    private client: CordX

    constructor(client: CordX) {
        this.client = client;
    }

    public get model() {
        return {
            create: async (): Promise<Responses> => {
                try {
                    const secret = crypto.randomBytes(32).toString('hex');

                    const update = await this.client.db.prisma.secrets.create({
                        data: { key: this.model.encrypt(secret) }
                    })

                    return {
                        success: true,
                        message: 'Here is the new API Secret, please do not abuse it xD',
                        data: {
                            id: update.id,
                            key: update.key
                        }
                    }

                } catch (err: unknown) {

                    if (err instanceof Error) {
                        return { success: false, message: `${err.message}` }
                    }

                    return { success: false, message: 'An unknown error occured!' }
                }
            },
            view: async (id: string): Promise<Responses> => {

                const secret = await this.client.db.prisma.secrets.findUnique({ where: { id } });

                if (!secret) return { success: false, message: 'Unable to locate a secret with the provided Secret ID' };

                return {
                    success: true,
                    message: `The requested secret has been sent to your DM\'s for security purposes.`,
                    data: { secret: secret.key }
                }
            },
            exists: async (key: string): Promise<Boolean> => {

                const secrets = await this.client.db.prisma.secrets.findMany();

                if (!secrets || secrets.length === 0) return false;

                const keys = secrets.map((secret: any) => this.model.decrypt(secret.key));

                if (keys.length === 0) return false;

                return keys.includes(key) ? true : false;
            },
            encrypt: (text: string): string => {
                const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex'), Buffer.alloc(16, 0));
                const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
                return encrypted.toString('hex');
            },
            decrypt: (encryptedText: string): string => {
                const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex'), Buffer.alloc(16, 0));
                const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
                return decrypted.toString('utf8');
            },

        }
    }
}
