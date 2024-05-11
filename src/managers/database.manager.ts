import { UserMethods, WebhookMethods, Responses, PartnerMethods, StatsMethods } from "../types/database/index"
import { LeaderboardData, TOTAL_UPLOADERS } from "../types/database/users";
import { User } from "../types/database/users";
import { Webhook } from "../types/database/webhooks";
import { Report } from "../types/database/reports";
import { EventEmitter } from "events";
import { Prisma, PrismaClient } from '@prisma/client';
import type CordX from "../client/cordx"
import Logger from "../utils/logger.util"
import { TextChannel } from "discord.js";

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

            leaderboard: async (): Promise<Responses> => {

                try {

                    const images = await this.prisma.images.findMany();
                    if (!images) return { success: false, message: 'No images found, oh the sadness!' };

                    const uploaders = images.reduce((acc, image) => {
                        acc[image.userid] = (acc[image.userid] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);

                    const topUploaders = Object.entries(uploaders)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, TOTAL_UPLOADERS)
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
                        new this.client.Embeds({
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
}
