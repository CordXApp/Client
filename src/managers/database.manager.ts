import { LeaderboardData } from "../types/database/users";
import { User } from "../types/database/users";
import { Webhook } from "../types/database/webhooks";
import { Report } from "../types/database/reports";
import { EventEmitter } from "events";
import { Prisma, PrismaClient } from '@prisma/client';
import type CordX from "../client/cordx";
import Logger from "../utils/logger.util";
import { TextChannel } from "discord.js";
import crypto from "node:crypto";
import dns from "node:dns";
import net from "node:net";

import {
    UserMethods,
    WebhookMethods,
    Responses,
    PartnerMethods,
    StatsMethods
} from "../types/database/index"

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
} from "../types/database/domains"

export class DatabaseManager {
    private client: CordX
    private logs: Logger
    public prisma: PrismaClient
    public emitter: EventEmitter

    constructor(client: CordX) {
        this.client = client;
        this.logs = new Logger("Database")
        this.prisma = new PrismaClient()
        this.emitter = new EventEmitter()
    }

    public get user(): UserMethods {
        return {
            create: async (data: User): Promise<Responses> => {

                const check = await this.prisma.users.findUnique({ where: { userid: data.userid as string } });

                if (check) return { success: false, message: 'User already exists in our database.' };

                const user = await this.prisma.users.create({
                    data: { ...data, permissions: [] as Prisma.permissionsUncheckedCreateNestedManyWithoutUsersInput }
                }).catch((err: Error) => {
                    return { success: false, message: err.message }
                });

                return { success: true, data: user }
            },
            exists: async (id: User['userid']): Promise<Boolean> => {

                const user = await this.prisma.users.findUnique({ where: { userid: id } });

                if (!user) return false;

                return true;
            },
            fetch: async (id: User['userid']): Promise<Responses> => {

                const user = await this.prisma.users.findUnique({ where: { userid: id } })

                if (!user) return { success: false, message: 'Unable to locate that user in our database.' };

                return { success: true, message: 'User found', data: user }
            },
            update: async (id: User['userid'], data: User): Promise<Responses> => {

                const check = await this.prisma.users.findUnique({ where: { userid: id } });

                if (!check) return { success: false, message: 'Unable to locate that user in our database.' };

                const user = await this.prisma.users.update({ where: { userid: id }, data: { ...data, permissions: [] as Prisma.permissionsUncheckedCreateNestedManyWithoutUsersInput } });

                if (!user) return { success: false, message: 'Unable to locate that user in our database.' };

                return { success: true, data: user }
            },
            delete: async (id: User['userid']): Promise<Responses> => {

                const check = await this.prisma.users.findUnique({ where: { userid: id } });

                if (!check) return { success: false, message: 'Unable to locate that user in our database.' };

                const user = await this.prisma.users.delete({ where: { userid: id } });

                return { success: true, data: user }
            },
            profile: async (id: User['userid']): Promise<Responses> => {

                const user = await this.prisma.users.findUnique({
                    where: { userid: id },
                    include: {
                        domains: true,
                        permissions: true
                    }
                });

                if (!user) return { success: false, message: 'Unable to locate that user in our database.' };

                return { success: true, data: user }
            }
        }
    }

    public get webhook(): WebhookMethods {
        return {
            /**
             * Create a new webhook in the database (token is encrypted before saving)
             * @param {Webhook} data - The data to create the webhook with
             * @returns {Responses} - The response from the database
             */
            create: async ({ id, token, name }: Webhook): Promise<Responses> => {

                const check = await this.webhook.exists(id);

                if (check) return { success: false, message: 'Webhook already exists in our database.' };

                const encrypted = await this.client.security.init.encrypt(token).catch((err: Error) => {
                    this.logs.error(err.stack as string)
                    return { success: false, message: err.message }
                })

                console.log(encrypted)

                await this.prisma.webhooks.create({
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

                const webhook = await this.prisma.webhooks.findUnique({ where: { id } });

                if (!webhook) return false;

                return true
            },
            fetch: async (name: Webhook['name']): Promise<Responses> => {

                const webhook = await this.prisma.webhooks.findFirst({ where: { name: name } });

                if (!webhook) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                const partial = await this.client.security.init.partial(webhook?.token).catch((err: Error) => {
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

                const check = await this.webhook.exists(id);

                if (!check) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                const webhook = await this.prisma.webhooks.update({ where: { id }, data });

                return {
                    success: true,
                    message: 'Webhook updated successfully',
                    data: webhook
                }
            },
            delete: async (id: Webhook['id']): Promise<Responses> => {

                const check = await this.webhook.exists(id);

                if (!check) return { success: false, message: 'Whoops, a webhook with the provided ID can not be found!' };

                await this.prisma.webhooks.delete({ where: { id } });

                return { success: true, message: 'Webhook deleted successfully' }
            }
        }
    }

    public get partner(): PartnerMethods {
        return {
            list: async (): Promise<Responses> => {
                const partners = await this.prisma.partners.findMany();

                if (!partners) return { success: false, message: 'No partners found, oh the sadness!' }

                return { success: true, data: partners }
            }
        }
    }

    public get stats(): StatsMethods {
        return {
            images: async (): Promise<Responses> => {
                const images = await this.prisma.images.findMany();

                if (!images) return { success: false, message: 'No images found, oh the sadness!' };

                return { success: true, data: images.length }
            },
            users: async (): Promise<Responses> => {
                const users = await this.prisma.users.findMany();

                if (!users) return { success: false, message: 'No users found, oh the sadness!' };

                return { success: true, data: users.length }
            },
            domains: async (): Promise<Responses> => {
                const domains = await this.prisma.domains.findMany();

                if (!domains) return { success: false, message: 'No domains found, oh the sadness!' };

                return { success: true, data: domains.length }
            },

            leaderboard: async (amount: number): Promise<Responses> => {

                try {

                    if (amount < 1 || amount > 15) return { success: false, message: 'Whoops, the top uploaders count should be between 1 and 15' }

                    const images = await this.prisma.images.findMany();
                    if (!images) return { success: false, message: 'No images found, oh the sadness! Did someone kill our database again?' };

                    const uploaders = images.reduce((acc, image) => {
                        acc[image.userid] = (acc[image.userid] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);

                    const topUploaders = Object.entries(uploaders)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, amount)
                        .map(([userid, count]) => ({ userid, count }));

                    const userArray: LeaderboardData[] = [];

                    for (const [index, user] of topUploaders.entries()) {
                        const position = index + 1;
                        let number = '';

                        const u = await this.client.users.fetch(user.userid);

                        if (position === 1) number = '🥇';
                        if (position === 2) number = '🥈';
                        if (position === 3) number = '🥉';
                        if (position > 3) number = `#${position}`;

                        userArray.push({
                            userid: u.id,
                            username: u.username as string,
                            globalName: u.globalName as string,
                            position: number,
                            total: user.count
                        })
                    }

                    return {
                        success: true,
                        data: userArray.sort((a: any, b: any) => a.unformatted - b.unformatted)
                    }
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        return { success: false, message: err.message }
                    }

                    return { success: false, message: 'An unknown error occurred' }
                }
            }
        }
    }

    public get report() {
        return {
            /**
             * Create a new report and save it to the database
             * @param {Report} data - The data to create the report with
             * @returns {Responses} - The response from the database
             * @example
             */
            create: async (data: Report): Promise<Responses | any> => {

                const id = await this.client.utils.base.createReportId();
                const guild = await this.client.guilds.cache.get('871204257649557604');
                const channel = await guild?.channels.fetch('1235836201559134259');

                this.logs.debug(JSON.stringify(data));

                const report = await this.prisma.reports.create({
                    data: {
                        id: id as string,
                        type: data.type,
                        author: data.author,
                        reason: data.reason,
                        status: 'OPEN',
                        mod: null,
                    }
                }).catch((err: Error) => {
                    this.logs.error(`Failed to create report: ${err.message}`);
                    this.logs.debug(`Stack trace: ${err.stack}`);
                    return { success: false, message: err.message }
                })

                if (channel && channel instanceof TextChannel) await channel.send({
                    content: '<@&1138246343412953218>',
                    embeds: [
                        new this.client.EmbedBuilder({
                            title: 'New Report',
                            description: `A new report has been filed by ${data.author}!`,
                            color: this.client.config.EmbedColors.base,
                            fields: [{
                                name: 'ID',
                                value: `\`${id as string}\``,
                                inline: true
                            }, {
                                name: 'Type',
                                value: `\`${data.type}\``,
                                inline: true
                            }, {
                                name: 'Status',
                                value: `\`OPEN\``,
                                inline: true
                            }, {
                                name: 'Reason',
                                value: `\`${data.reason}\``,
                                inline: false
                            }]
                        })
                    ]
                })

                return { success: true, data: report };
            },
            list: async (author: string): Promise<Responses> => {

                const reports = await this.prisma.reports.findMany({ where: { author: author } });

                if (!reports) return { success: false, message: 'No reports found for that user!' };

                return { success: true, data: reports }
            },
            fetch: async (id: string, user: string): Promise<Responses> => {

                const report = await this.prisma.reports.findUnique({ where: { id: id } });

                const db_user = await this.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                });

                if (!report) return { success: false, message: 'No report found with that ID!' };

                if (db_user && report.author !== user && !db_user.permissions.some(permission => permission.name === 'STAFF')) return {
                    success: false,
                    message: 'Sorry chief, you do not posess the powers necessary to view this report!'
                };

                return { success: true, data: report }
            }
        }
    }

    public get secret() {
        return {
            create: async (): Promise<Responses> => {
                try {
                    const secret = crypto.randomBytes(32).toString('hex');

                    const update = await this.prisma.secrets.create({
                        data: { key: this.secret.encrypt(secret) }
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

                const secret = await this.prisma.secrets.findUnique({ where: { id } });

                if (!secret) return { success: false, message: 'Unable to locate a secret with the provided Secret ID' };

                return {
                    success: true,
                    message: `The requested secret has been sent to your DM\'s for security purposes.`,
                    data: { secret: secret.key }
                }
            },
            exists: async (key: string): Promise<Boolean> => {

                const secrets = await this.prisma.secrets.findMany();

                if (!secrets || secrets.length === 0) return false;

                const keys = secrets.map((secret: any) => this.secret.decrypt(secret.key));

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

    public get domain() {
        return {
            create: async (dom: string, owner: string): Promise<Responses> => {

                if (!dom) return { success: false, message: 'Please provide a valid domain without the http/https protocol' };

                const validate = await this.domain.validate(dom as string);

                if (!validate.success) return { success: false, message: validate.message }

                const create = await this.prisma.domains.create({
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

                const domain = await this.prisma.domains.findUnique({ where: { name: dom } });

                if (!domain) return { success: false, message: 'Unable to locate that domain in our database' };

                return {
                    success: true,
                    message: 'Here is the domain you requested',
                    data: domain
                }
            },
            exists: async (dom: string): Promise<Responses> => {

                const domain = await this.prisma.domains.findUnique({ where: { name: dom } });

                if (!domain) return { success: false, message: 'Unable to locate that domain in our database' }

                return {
                    success: true,
                    message: 'Here is the domain info',
                    data: domain
                }
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
                const blacklisted = await this.domain.blacklisted(dom as string, config);

                if (blacklisted) return { success: false, message: BLACKLIST_ERROR };

                return { success: true, message: SUCCESS_MESSAGE }
            },
            blacklisted: async (dom: string, config: DomainConfig): Promise<boolean> => {
                const isBlacklisted = config.blacklist.some((blacklisted: any) => dom.includes(blacklisted));

                return isBlacklisted ? true : false
            },
            verifyRecord: (dom: string, txtName: string): Promise<boolean> => {
                return new Promise(async (resolve, reject) => {

                    const exists = await this.domain.exists(dom);

                    if (!exists) return false

                    const filtered = this.domain.removeSub(dom);

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

                await this.prisma.domains.deleteMany({
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
