import { UserMethods, WebhookMethods, Responses, PartnerMethods, StatsMethods } from "../types/database/index"
import { LeaderboardData, TOTAL_UPLOADERS } from "../types/database/users";
import { File, SyncAll, SyncBucket } from "../types/spaces/files";
import { User } from "../types/database/users";
import { Webhook } from "../types/database/webhooks";
import { Report } from "../types/database/reports";
import { EventEmitter } from "events";
import { PrismaClient } from '@prisma/client';
import type CordX from "../client/CordX"
import Logger from "../utils/Logger"
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

                const user = await this.prisma.users.create({ data: data }).catch((err: Error) => {
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

                const user = await this.prisma.users.update({ where: { userid: id }, data: data });

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

    public get correct() {
        return {
            images: async (user: string): Promise<any> => {

                if (!user) return {
                    success: false,
                    message: 'No user provided'
                }

                const images = await this.prisma.images.findMany({ where: { userid: user } });
                const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'];

                let valid = 0;
                let invalid = 0;
                let failed = 0;

                this.logs.info(`Starting upload correction for: ${user}`);

                for (const image of images) {
                    const spl = image.fileid.split('.');
                    const ext = spl[spl.length - 1];

                    if (spl.length > 1 && typeof ext === 'string' && validExtensions.includes(ext)) {
                        this.logs.info(`Validated: ${image.fileid}`);
                        valid++;
                    } else {
                        invalid++;

                        this.logs.info(`Invalidated: ${image.fileid}`)

                        await this.prisma.images.delete({ where: { id: image.id } }).catch((err: Error) => {
                            this.logs.error(err.stack as string);
                            failed++

                            return {
                                success: false,
                                message: err.message,
                                data: {
                                    valid,
                                    invalid,
                                    failed
                                }
                            }
                        })

                        this.logs.info(`Deleted: invalid file: ${image.fileid}`)
                    }
                }

                this.logs.ready(`Upload correction complete`);
                this.logs.info(`Valid: ${valid}, Invalid: ${invalid}, Failed: ${failed}`);

                return {
                    success: true,
                    message: 'Corrected user image count',
                    data: {
                        valid,
                        invalid,
                        failed
                    }
                }
            }
        }
    }

    public get bucket() {
        return {
            sync_all: async (): Promise<{ results: SyncAll }> => {
                const users = await this.prisma.users.findMany();

                const results = {
                    synced: 0,
                    skipped: 0,
                    deleted: 0,
                    failed: 0,
                    users: users.length,
                    muser: 0
                }

                this.logs.debug(`Syncing bucket content for ${users.length} users! please wait...`);

                for (const user of users) {

                    this.emitter.emit('progress', {
                        synced: 0,
                        skipped: 0,
                        deleted: 0,
                        failed: 0,
                        muser: 0,
                        user: user.userid
                    })

                    const bucket: Responses = await this.bucket.clear(user.userid as string, true);

                    this.emitter.emit('progress', {
                        synced: 0,
                        skipped: bucket.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed,
                        muser: bucket.missing.muser,
                        user: user.userid
                    })

                    const update = await this.bucket.update(user.userid as string, true);

                    this.emitter.emit('progress', {
                        synced: update.data.synced,
                        skipped: bucket.data.skipped + update.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed + update.data.failed,
                        muser: bucket.missing.muser,
                        user: user.userid
                    })

                    if (!update.success) {
                        results.muser++

                        this.emitter.emit('progress', {
                            synced: update.data.synced,
                            skipped: bucket.data.skipped + update.data.skipped,
                            deleted: bucket.data.deleted,
                            failed: bucket.data.failed + update.data.failed,
                            muser: bucket.missing.muser,
                            user: user.userid
                        })

                        continue;
                    }

                    this.emitter.emit('progress', {
                        synced: update.data.synced,
                        skipped: bucket.data.skipped + update.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed + update.data.failed,
                        muser: bucket.missing.muser,
                        user: user.userid
                    })

                    results.synced += update.data.synced;
                    results.skipped += bucket.data.skipped + update.data.skipped;
                    results.deleted += bucket.data.deleted;
                    results.failed += bucket.data.failed + update.data.failed;
                    results.muser += update.missing.muser;
                }

                this.logs.info(`Synced: ${results.synced} | Skipped: ${results.skipped} | Deleted: ${results.deleted} | Failed: ${results.failed} | Missing: ${results.muser}`)
                this.logs.ready(`All available bucket content has been synced successfully!`)


                return { results };
            },
            sync: async (user: string): Promise<{ results: SyncBucket }> => {
                this.logs.info(`Staring bucket sync for: ${user}`);
                const results = {
                    synced: 0,
                    skipped: 0,
                    deleted: 0,
                    failed: 0,
                    total: 0
                }

                this.emitter.emit('progress', {
                    message: 'Starting the sync, please wait...',
                    synced: 0,
                    skipped: 0,
                    deleted: 0,
                    failed: 0,
                    total: 0
                });

                const list: any = await this.client.utils.spaces.sync(user);
                const data: File[] = list.data;

                results.total = data.length;

                this.emitter.emit('progress', {
                    message: 'Connection to user bucket established, attempting to delete and update...',
                    synced: 0,
                    skipped: 0,
                    deleted: 0,
                    failed: 0,
                    total: data.length
                });

                const bucket: Responses = await this.bucket.clear(user, false);

                if (!bucket.success) {
                    results.failed++

                    this.emitter.emit('progress', {
                        message: 'Deletion failed, skipping update...',
                        synced: 0,
                        skipped: bucket.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed,
                        total: data.length
                    })
                }

                this.emitter.emit('progress', {
                    message: 'Deletion complete, syncing uploads with bucket...',
                    synced: 0,
                    skipped: bucket.data.skipped,
                    deleted: bucket.data.deleted,
                    failed: bucket.data.failed,
                    total: data.length
                })

                const update: Responses = await this.bucket.update(user, false);

                if (!update.success) {
                    results.failed++

                    this.emitter.emit('progress', {
                        message: 'Update failed, skipping...',
                        synced: update.data.synced,
                        skipped: bucket.data.skipped + update.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed + update.data.failed,
                        total: data.length
                    })
                }

                this.emitter.emit('progress', {
                    message: 'Sync complete, returning results...',
                    synced: update.data.synced,
                    skipped: bucket.data.skipped + update.data.skipped,
                    deleted: bucket.data.deleted,
                    failed: bucket.data.failed + update.data.failed,
                    total: data.length

                });

                this.logs.ready(`User bucket has been synchronized successfully`);

                results.synced += update.data.synced;
                results.skipped += bucket.data.skipped + update.data.skipped;
                results.deleted += bucket.data.deleted;
                results.failed += bucket.data.failed + update.data.failed;

                return { results }
            },
            clear: async (user: string, all: boolean): Promise<Responses> => {
                let failed = 0;
                let deleted = 0;
                let skipped = 0;
                let muser = 0;

                const images = await this.prisma.images.findMany({ where: { userid: user } });

                this.logs.debug(`Removing ${images.length} files for: ${user}...`)

                const list: any = await this.client.utils.spaces.sync(user as string);
                const count = await this.prisma.images.findMany({ where: { userid: user as string } });

                const data: File[] = list.data;

                if (!list.success) {
                    muser++
                    return {
                        success: false,
                        message: list.message,
                        data: {
                            skipped,
                            deleted,
                            failed
                        },
                        missing: {
                            muser
                        }
                    }
                }

                if (all && count.length === data.length) {
                    skipped++
                }

                for (const image of images) {
                    try {

                        if (images.length > 250) {
                            skipped++;
                            continue
                        }

                        await this.prisma.images.delete({ where: { id: image.id } }).catch((err: Error) => {
                            this.logs.error(err.message as string)
                            failed++
                        });
                        deleted++;
                    } catch (err: unknown) {
                        if (err instanceof Error) {
                            this.logs.error(err.stack as string);
                            failed++;
                            continue;
                        }

                        failed++
                        continue;
                    }
                }

                this.logs.debug(`[RESULTS] Removed: ${deleted} | Skipped: ${skipped} | Failed: ${failed}`);

                return {
                    success: true,
                    message: 'Successfully cleared user uploads',
                    data: {
                        failed,
                        deleted,
                        skipped
                    },
                    missing: {
                        muser
                    }
                }
            },
            update: async (user: string, all: boolean): Promise<Responses> => {
                let synced = 0;
                let skipped = 0;
                let failed = 0;
                let muser = 0;

                const list: any = await this.client.utils.spaces.sync(user);
                const count = await this.prisma.images.findMany({ where: { userid: user } });

                if (!list.success) {
                    muser++
                    return {
                        success: false,
                        message: list.message,
                        data: {
                            synced,
                            skipped,
                            failed
                        },
                        missing: {
                            muser
                        }
                    }
                }

                const data: File[] = list.data;

                if (all && count.length === data.length) {
                    skipped++;
                }

                this.logs.debug(`Uploading: ${data.length} files to: ${user}\'s database...`)

                for (const file of data) {

                    const check = await this.prisma.images.findFirst({ where: { fileid: file.Key.split('/')[1] as string } });

                    if (check) {
                        skipped++
                        continue;
                    }

                    if (file.Key.endsWith('.gitkeep')) {
                        skipped++
                        continue;
                    }

                    if (!file.Key.includes(user)) {
                        skipped++
                        continue;
                    }

                    await this.prisma.images.create({
                        data: {
                            userid: file.Key.split('/')[0] as string,
                            fileid: file.Key.split('/')[1] as string,
                            filename: file.Key.split('/')[1]?.split('.')[0] as string,
                            date: file.LastModified,
                            name: file.Key.split('/')[1]?.split('.')[0] as string,
                            size: file.Size,
                            type: file.Key.split('/')[1]?.split('.')[1]
                        }
                    }).catch((err: Error) => {
                        this.logs.error(err.stack as string);
                        failed++

                        return {
                            success: false,
                            message: err.message,
                            data: {
                                synced,
                                skipped,
                                failed,
                                muser
                            },
                            missing: {
                                muser
                            }
                        }
                    })

                    synced++
                }

                this.logs.debug(`[RESULTS]: Synced: ${synced} | Skipped: ${skipped} | Failed: ${failed}`);

                return {
                    success: true,
                    message: 'Successfully synced user uploads',
                    data: {
                        synced,
                        skipped,
                        failed
                    },
                    missing: {
                        muser
                    }
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
                const db_user = await this.prisma.users.findUnique({ where: { userid: user } });

                if (!report) return { success: false, message: 'No report found with that ID!' };

                if (db_user && report.author !== user && !db_user.staff) return {
                    success: false,
                    message: 'Sorry chief, you do not posess the powers necessary to view this report!'
                };

                return { success: true, data: report }
            }
        }
    }
}
