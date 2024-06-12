import { Responses } from "../../../types/database/index"
import { Constructor } from "../../../types/database/clients";
import { DatabaseClient } from "../../prisma.client";
import { Modules } from "../../../modules/base.module";
import Logger from "../../../utils/logger.util";
import type CordX from "../../../client/cordx";
import crypto from "node:crypto";
import dns from "node:dns";
import net from "node:net";


import {
    DomainConfig,
    BLACKLIST_KEYWORDS,
    BLACKLIST_ERROR,
    IP_ADDRESS_ERROR,
    INVALID_DOMAIN_ERROR,
    INVALID_PATTERN_ERROR,
    ESCAPE_SEQUENCE_ERROR,
    PROTOCOL_ERROR,
    SUCCESS_MESSAGE
} from "../../../types/database/domains"
import { PrismaClient } from "@prisma/client";

export class UserDomClient {
    private client: CordX
    private logs: Logger;
    private prisma: PrismaClient;
    private db: DatabaseClient;
    private mods: Modules;

    constructor(data: Constructor) {
        this.client = data.client;
        this.logs = data.logs;
        this.prisma = data.prisma;
        this.db = data.db;
        this.mods = data.mods;
    }

    public get model() {
        return {
            create: async (dom: string, owner: string): Promise<Responses> => {

                if (!dom) return { success: false, message: 'Please provide a valid domain without the http/https protocol' };

                const validate = await this.model.validate(dom as string);

                if (!validate.success) return { success: false, message: validate.message }

                const create = await this.db.prisma.domains.create({
                    data: {
                        name: dom,
                        content: crypto.randomBytes(15).toString('hex'),
                        verified: false,
                        user: owner
                    }
                })

                return {
                    success: true,
                    message: 'Domain created successfully',
                    data: create
                }
            },
            fetch: async (dom: string): Promise<Responses> => {

                const domain = await this.db.prisma.domains.findUnique({ where: { name: dom } });

                if (!domain) return { success: false, message: 'Unable to locate that domain in our database' };

                return {
                    success: true,
                    message: 'Here is the domain you requested',
                    data: domain
                }
            },
            exists: async (dom: string): Promise<Responses> => {

                const domain = await this.db.prisma.domains.findUnique({ where: { name: dom } });

                if (!domain) return { success: false, message: 'Unable to locate that domain in our database' }

                return {
                    success: true,
                    message: 'Here is the domain info',
                    data: domain
                }
            },
            verified: async (dom: string): Promise<boolean> => {
                const domain = await this.client.db.prisma.domains.findUnique({ where: { name: dom } });

                if (!domain) return false;

                return domain.verified ? true : false
            },
            /**
             * Validate a domain name to ensure it follows our standards
             * @param {dom} string The domain name to validate
             * @returns {Promise<Responses>} The response structure
             */
            validate: async (dom: string): Promise<Responses> => {
                const isNotIP = net.isIP(dom) != 0;

                if (isNotIP) return { success: false, message: IP_ADDRESS_ERROR };

                const pattern = new RegExp('^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$');

                const parts = dom.split('.');

                if (parts.length < 2) return { success: false, message: INVALID_DOMAIN_ERROR };

                if (!parts.every(part => pattern.test(part))) return { success: false, message: INVALID_PATTERN_ERROR };

                if (/\\|https?:\/\//.test(dom)) return { success: false, message: dom.includes('\\') ? ESCAPE_SEQUENCE_ERROR : PROTOCOL_ERROR };

                const config: DomainConfig = { blacklist: BLACKLIST_KEYWORDS };
                const blacklisted = await this.model.blacklisted(dom as string, config);

                if (blacklisted) return { success: false, message: BLACKLIST_ERROR };

                return { success: true, message: SUCCESS_MESSAGE }
            },
            blacklisted: async (dom: string, config: DomainConfig): Promise<boolean> => {
                const isBlacklisted = config.blacklist.some((blacklisted: any) => dom.includes(blacklisted));

                return isBlacklisted ? true : false
            },
            verifyRecord: (dom: string, txtName: string): Promise<boolean> => {
                return new Promise(async (resolve, reject) => {

                    const exists = await this.model.exists(dom);

                    if (!exists) return false

                    const filtered = this.model.removeSub(dom);

                    dns.resolve(filtered, (err, records) => {
                        if (err) return resolve(false);

                        const hasRecord = records.some((r: any) => r.includes());

                        resolve(hasRecord)
                    })
                })
            },
            removeSub: (dom: string): string => {
                const parts = dom.split('.');
                const root = parts.slice(-2).join('.');

                return root;
            },
            wipeUnverified: async (): Promise<void> => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 15);

                await this.client.db.prisma.domains.deleteMany({
                    where: {
                        verified: false,
                        createdAt: {
                            lt: thirtyDaysAgo
                        }
                    }
                });
            }
        }
    }
}
