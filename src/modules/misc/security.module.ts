import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { SecurityClient } from "../../types/modules/security";
import type CordX from "../../client/cordx"
import Logger from "../../utils/logger.util"

export class Security implements SecurityClient {
    private client: CordX
    private logs: Logger

    constructor(client: CordX) {
        this.client = client;
        this.logs = new Logger("Database")
    }

    public get init() {

        const { ENCRYPTION_KEY } = process.env;

        if (!ENCRYPTION_KEY) throw new Error('No encryption key provided in the environment variables');

        return {
            /**
             * Encrypts a string using AES-256-GCM
             * @param data The data to encrypt
             * @returns The encrypted data
             */
            encrypt: async (data: string, key?: string): Promise<string> => {
                try {
                    if (!key) key = ENCRYPTION_KEY
                    const iv = randomBytes(12);
                    const cipher = createCipheriv('aes-256-gcm', key, iv)
                    let encrypted = cipher.update(data, 'utf8', 'hex');
                    encrypted += cipher.final('hex');
                    const tag = cipher.getAuthTag();
                    return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
                } catch (err: any) {
                    this.logs.error(err.stack)
                    throw new Error(err.message)
                }
            },
            /**
             * Decrypts a string using AES-256-GCM
             * @param data The data to decrypt
             * @returns The decrypted data
             */
            decrypt: async (data: string, key?: string): Promise<string> => {
                try {
                    if (!key) key = ENCRYPTION_KEY;
                    const parts: any = data.split(':');
                    const iv = Buffer.from(parts.shift(), 'hex');
                    const tag = Buffer.from(parts.pop(), 'hex');
                    const decipher = createDecipheriv('aes-256-gcm', key, iv);
                    decipher.setAuthTag(tag);
                    let decrypted = decipher.update(parts.join(':'), 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    return decrypted;
                } catch (err: any) {
                    this.logs.error(err.stack)
                    throw new Error(err.message)
                }
            },
            /**
             * Returns the encrypted data without the IV and tag (partial data)
             * @param data The data to partially encrypt
             * @returns The partially encrypted data
             */
            partial: async (data: string): Promise<string> => {
                try {
                    const parts: any = data.split(':');
                    return parts[0];
                } catch (err: any) {
                    this.logs.error(err.stack)
                    throw new Error(err.message)
                }
            }
        }
    }
}
