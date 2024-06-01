import { ListObjectsV2CommandOutput, S3 } from "@aws-sdk/client-s3";
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";
import { Responses } from "../types/database/index";
import { FastifyReply, FastifyRequest } from "fastify";
import { existsSync, statSync, createReadStream, readFileSync } from "fs";
import { HandleUploadParams } from "../types/server/upload.types";
import type CordX from "../client/cordx"
import { EventEmitter } from "events";
import Logger from "../utils/logger.util"
import { randomBytes } from "node:crypto";

import {
    File,
    EmitterResponse,
    DropContentOpts,
    SpacesClient,
    SpacesResponse,
    UpdateContentOpts
} from "../types/modules/spaces";
import { randomUUID } from "crypto";

export class Spaces implements SpacesClient {
    private client: CordX;
    public logs: Logger;
    public bucket: S3;
    public emitter: EventEmitter;
    private marker: string | undefined;
    private truncated: boolean;
    private objects: File[];
    private currentPercentage: number;
    private lastPercentage: number;

    constructor(client: CordX) {
        this.client = client;
        this.logs = new Logger("Spaces");
        this.emitter = new EventEmitter();
        this.bucket = new S3({
            forcePathStyle: false,
            endpoint: 'https://nyc3.digitaloceanspaces.com',
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.SPACES_KEY as string,
                secretAccessKey: process.env.SPACES_SECRET as string
            }
        })
        this.truncated = true;
        this.objects = [];
        this.currentPercentage = 0;
        this.lastPercentage = 0;
    }

    /**
     * Handle a users bucket/space.
     */
    public get user() {
        return {
            /**
             * List all of a users bucket data
             */
            list: async (user: string): Promise<SpacesResponse> => {
                try {
                    while (this.truncated) {
                        const bucket = await this.bucket.listObjects({ Bucket: 'cordx', Prefix: user, Marker: this.marker });

                        if (!bucket || !bucket.Contents) return { success: false }

                        const filtered = bucket.Contents.filter(file => !file.Key?.endsWith('.gitkeep'));

                        this.objects = [...this.objects, ...filtered.filter((item): item is File => item.Key !== undefined)];
                        this.truncated = bucket.IsTruncated ? true : false;

                        if (this.truncated) this.marker = bucket.Contents[bucket.Contents.length - 1]?.Key
                    }

                    return { success: true, data: this.objects };
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        this.logs.error(`Bucket error: ${err.message}`);
                        this.logs.debug(`Stack trace: ${err.stack}`);

                        return { success: false, message: `Failed to fetch bucket data for ${user}: ${err.message}` };
                    }

                    return { success: false, message: `Failed to fetch bucket data for ${user}` };
                }
            },
            /**
             * Determine the size of a users bucket!
             */
            size: async (user: string): Promise<SpacesResponse> => {

                const params = {
                    Prefix: `${user}/`,
                    Bucket: 'cordx',
                    Key: `${user}/`
                }

                const database = await this.client.db.prisma.images.findMany({ where: { userid: user } });

                const data = await new Promise<ListObjectsV2CommandOutput>((resolve, reject) => {
                    this.bucket.listObjectsV2(params, (err: Error, data?: ListObjectsV2CommandOutput) => {
                        if (err) reject(err);

                        if (data) resolve(data);
                    })
                })

                if (!data || !database) return {
                    success: false,
                    message: 'Unable to locate your bucket.'
                }

                const valid = data?.Contents?.filter(i => i?.Key?.includes(user));

                if (!valid || valid.length === 0) return {
                    success: false,
                    message: `Looks like you have no content in your bucket`
                }

                return {
                    success: true,
                    message: `Found: ${data?.Contents?.length} files in bucket for user`,
                    data: {
                        bucket_size: await this.client.utils.format.units(data?.Contents?.map(i => i.Size).reduce((a: any, b: any) => a + b)),
                        bucket_db_size: await this.client.utils.format.units(database.map(i => i.size).reduce((a: any, b: any) => a + b))
                    }
                }
            }
        }
    }

    public get bucket_db() {
        return {
            /**
             * Drop the users bucket database content
             * @param {opts.user} string the user to drop file(s) for
             * @param {opts.force} boolean force the operation if necessary
             */
            drop: async (opts: DropContentOpts): Promise<SpacesResponse> => {

                this.currentPercentage = 0;
                this.lastPercentage = 0;
                let shouldContinue = true;

                this.logs.info(`Dropping bucket database content for: ${opts.user}`);

                this.emitter.emit('progress', {
                    message: 'Dropping your database bucket content, this may take some time but i will update the progress below when necessary!',
                    percentage: '0% complete',
                    total: '0 files processed'
                })

                const list = await this.user.list(opts.user);
                const data = await this.client.db.prisma.images.findMany({ where: { userid: opts.user } });

                if (!data || !list.success) {
                    this.logs.debug(`Unable to locate bucket for: ${opts.user}, cancelling operation!`);
                    return {
                        success: false,
                        message: `Unable to locate your bucket, do you have a CordX Account/have you uploaded anything!`
                    };
                }

                const bucket: File[] = list.data;

                if (data.length === bucket.length) {
                    this.logs.debug(`Bucket content for: ${opts.user} is in sync, cancelling operation!`);
                    return {
                        success: false,
                        message: `Your bucket is already in-sync, cancelling operation!`
                    }
                }

                if (!opts.force && data.length > 250) {
                    this.logs.debug(`Bucket content for: ${opts.user} exceeds 250 total files, cancelling delete operation!`);
                    this.logs.info(`You can force this action to continue by re-executing it using the \`force: true\` flag`);

                    shouldContinue = false;
                }

                const deletedIds: any = data.map(file => file.id);

                this.logs.debug(`Bucket database content deletion: ${this.currentPercentage.toFixed(0)}% complete`)

                if (shouldContinue) {
                    for (let i = 0; i < deletedIds.length; i++) {

                        await this.client.db.prisma.images.delete({ where: { id: deletedIds[i] } })
                            .then(() => {
                                this.currentPercentage = ((i + 1) / deletedIds.length) * 100;
                                let roundedPercentage = Math.round(this.currentPercentage);
                                if (roundedPercentage % 25 === 0 && roundedPercentage !== this.lastPercentage) {
                                    this.logs.debug(`Bucket database content deletion: ${this.currentPercentage.toFixed(0)}% complete`);
                                    this.lastPercentage = roundedPercentage;

                                    this.emitter.emit('progress', {
                                        message: 'Please note: percentage will be updated by 25% intervals until complete!',
                                        percentage: `${this.currentPercentage.toFixed(0)}% complete`,
                                        total: `${i + 1} files processed`
                                    })
                                }
                            }).catch((err: Error) => {
                                this.logs.error(`Failed to delete bucket database content for user ${opts.user}`);
                                this.logs.debug(`Stack trace: ${err.stack}`)

                                return {
                                    success: false,
                                    message: err.message as string
                                }
                            });
                    }
                }

                this.logs.debug(`Successfully wiped bucket database content for user: ${opts.user}`);

                this.emitter.emit('progress', {
                    message: opts.force ? 'Successfully wiped your database bucket content, please wait while i start the re-sync operation!' : 'Skipped bucket database content deletion as you have more than 250 files in your bucket and the operation was not forced, please wait while i start the re-sync operation!',
                    percentage: '100% complete',
                    total: opts.force ? '0 files processed' : `${deletedIds.length} files processed`
                })

                return { success: true }
            },
            update: async (opts: UpdateContentOpts): Promise<SpacesResponse> => {

                this.currentPercentage = 0;
                this.lastPercentage = 0;

                this.logs.info(`Syncing bucket database content for: ${opts.user}`);

                this.emitter.emit('progress', {
                    message: 'Uploading bucket content to our database, this may take some time but i will update the progress below when necessary!',
                    percentage: '0% complete',
                    total: '0 files processed'
                })

                const list = await this.user.list(opts.user);
                const count = await this.client.db.prisma.images.count({ where: { userid: opts.user } });

                if (!list.success) {
                    this.logs.debug(`Unable to locate bucket for: ${opts.user}, cancelling operation!`);
                }

                const bucket: File[] = list.data;

                if (bucket.length === count) {
                    this.logs.debug(`Bucket database content for: ${opts.user} is in sync, cancelling operation!`);
                    return {
                        success: false,
                        message: 'Your bucket is already in-sync, cancelling operation!'
                    }
                }

                this.logs.debug(`Synchronizing: ${bucket.length} total files to the bucket database for ${opts.user}`);

                for (let i = 0; i < bucket.length; i++) {
                    const file = bucket[i];

                    const check = await this.client.db.prisma.images.findFirst({
                        where: { fileid: file?.Key.split('/')[1] as string }
                    })

                    if (check) {
                        continue;
                    }

                    if (file?.Key.endsWith('.gitkeep')) {
                        this.logs.debug(`Skipping keep file as this is unnecessary/irrelevant storage`);
                        continue;
                    }

                    if (!file?.Key.includes(opts.user)) {
                        this.logs.debug(`Whoops, this file doesn\'t belong to the requested user, skipping...`);
                        continue;
                    }

                    const createData = {
                        userid: file?.Key.split('/')[0] as string,
                        fileid: file?.Key.split('/')[1] as string,
                        filename: file?.Key.split('/')[1]?.split('.')[0],
                        date: file?.LastModified,
                        name: file?.Key.split('/')[1]?.split('.')[0],
                        size: file?.Size,
                        type: file?.Key.split('.')[1]
                    }

                    await this.client.db.prisma.images.create({ data: createData })
                        .then(() => {
                            this.currentPercentage = ((i + 1) / bucket.length) * 100;
                            let roundedPercentage = Math.round(this.currentPercentage);
                            if (roundedPercentage % 25 === 0 && roundedPercentage !== this.lastPercentage) {
                                this.logs.debug(`Bucket database content upload: ${this.currentPercentage.toFixed(0)}% complete`);
                                this.lastPercentage = roundedPercentage;

                                this.emitter.emit('progress', {
                                    message: 'Please note: percentage will be updated by 25% intervals until complete!',
                                    percentage: `${this.currentPercentage.toFixed(0)}% complete`,
                                    total: `${i + 1} files processed`
                                })
                            }
                        }).catch((err: Error) => {
                            this.logs.error(`Failed to upload file: ${file.Key.split('/')[1]}`);
                            this.logs.debug(`Stack trace: ${err.stack}`)

                            return {
                                success: false,
                                message: err.message as string
                            };
                        });
                }

                this.emitter.emit('progress', {
                    message: 'Successfully synced your bucket with our database, please wait while i cleanup the process and ensure nothing was missed!',
                    percentage: '100% complete',
                    total: `${bucket.length} files processed`
                });

                this.logs.ready(`Successfully synced bucket with database for: ${opts.user}`)

                return { success: true }
            }
        }
    }

    public get actions() {
        return {
            sync_user: async (user: string, force: boolean): Promise<EmitterResponse> => {

                this.logs.info(`Starting bucket sync operation for: ${user}`);

                const list = await this.user.list(user);

                if (!list.success) return {
                    results: {
                        success: false,
                        message: 'Unable to locate your bucket, do you have a CordX Profile and have you uploaded any content?'
                    }
                }

                const drop: SpacesResponse = await this.bucket_db.drop({ user, force });

                if (!drop.success) {
                    return {
                        results: {
                            success: false,
                            message: drop.message
                        }
                    }
                }

                const update: SpacesResponse = await this.bucket_db.update({ user, force });

                if (!update.success) {
                    return {
                        results: {
                            success: false,
                            message: update.message
                        }
                    }
                }

                return {
                    results: { success: true }
                }
            },
            /**
             * Sync all files in the bucket to the database
             * @returns {Promise<SyncAll>}
             */
            sync_all: async (): Promise<EmitterResponse> => {

                const users = await this.client.db.prisma.users.findMany();

                if (!users) return {
                    results: {
                        success: false,
                        message: 'No users found in the database, cancelling operation!'
                    }
                }

                this.logs.info(`Starting bucket sync operation for ${users.length} users`);

                for (const user of users) {
                    const list = await this.user.list(user.id);

                    if (!list.success) return {
                        results: {
                            success: false,
                            message: 'Unable to locate your bucket, do you have a CordX Profile and have you uploaded any content?'
                        }
                    }

                    const drop: SpacesResponse = await this.bucket_db.drop({ user: user.id, force: false });

                    if (!drop.success) {
                        return {
                            results: {
                                success: false,
                                message: drop.message
                            }
                        }
                    }

                    const update: SpacesResponse = await this.bucket_db.update({ user: user.id, force: false });

                    if (!update.success) {
                        return {
                            results: {
                                success: false,
                                message: update.message
                            }
                        }
                    }
                }

                return {
                    results: {
                        success: true
                    }
                }
            },
            check: async (user: string): Promise<SpacesResponse> => {

                const toCheck = await this.client.db.prisma.images.findMany({ where: { userid: user } });
                const bucket = await this.user.list(user);

                if (!bucket.success) return {
                    success: false,
                    message: bucket.message
                }

                if (toCheck.length === bucket.data.length) return {
                    success: true,
                    message: 'Your bucket is in-sync with the database!'
                }

                return {
                    success: true,
                    message: 'Your bucket is out of sync with the database, please run the \`/sync bucket\` command to fix this! We recommend you set the \`force\` flag to false when syncing your bucket.'
                }
            }
        }
    }

    public get stats() {
        return {
            profile: async (user: string): Promise<SpacesResponse> => {

                const data = await this.client.db.prisma.images.findMany({ where: { userid: user } });
                const known: string[] = ['.png', 'gif', 'mp4', '.jpg', '.jpeg']

                const png = data.filter(f => f.fileid.includes('.png'));
                const gif = data.filter(f => f.fileid.includes('.gif'));
                const mp4 = data.filter(f => f.fileid.includes('.mp4'));
                const unk = data.filter(f => !known.some(type => f.fileid.includes(type)));
                const used = await this.user.size(user);

                if (!used.success) return {
                    success: false,
                    message: `${used?.message}`
                }


                return {
                    success: true,
                    data: {
                        storage: {
                            bucket: used.data.bucket_size,
                            database: used.data.bucket_db_size
                        },
                        files: {
                            total: data.length,
                            png: png.length,
                            gif: gif.length,
                            mp4: mp4.length,
                            other: unk.length
                        }
                    }
                }
            }
        }
    }

    public get sharex() {
        return {
            handleUpload: async ({ req, res, files, secret, userid }: HandleUploadParams) => {

                const file = files.sharex;
                const data = readFileSync(file.path);
                const mime = file.name.substr(file.name.lastIndexOf('.') + 1);
                const fileId = await this.sharex.makeId(10);
                const user = await this.client.db.user.model.fetch(userid as string);
                const env = req.client.user!.id === '829979197912645652' ? 'development' : 'production';
                const dev = await req.client.perms.user.has({ user: userid, perm: 'DEVELOPER' });
                const getBase = (req: FastifyRequest) => `${env === 'development' ? 'http' : 'https'}://${req.headers['x-cordx-host'] || req.headers.host}`;
                const dom = await req.client.db.domain.model.exists(getBase(req));

                if (!file) return res.status(400).send({
                    status: 'NO_POST_DATA',
                    message: 'No valid files were provided!',
                });

                if (req.headers.host!.includes('dev.cordx.lol') && !dev) return res.status(400).send({
                    status: 'DEVELOPER_NOT_ENABLED',
                    message: 'You must be a developer to upload to our development domain ;)',
                })

                if (req.headers.host!.includes('beta.cordx.lol') && !user.data.beta) return res.status(400).send({
                    status: 'BETA_NOT_ENABLED',
                    message: 'You must be a beta tester to upload to our beta domain ;)',
                });

                if (dom.success && !(await this.client.db.domain.model.verified(getBase(req)))) return res.status(400).send({
                    status: 'DOMAIN_NOT_VERIFIED',
                    message: 'Your domain is not verified, please verify your domain before uploading!',
                });

                const formattedSize = await this.sharex.formatSize(file.size);

                const params = {
                    Bucket: 'cordx',
                    ACL: 'public-read' as ObjectCannedACL,
                    Key: `${userid}/${fileId}.${mime}`,
                    Body: data
                }

                await this.bucket.send(new PutObjectCommand(params)).then(async () => {
                    const dateString = file.lastModifiedDate.toISOString()

                    await req.client.db.prisma.images.create({
                        data: {
                            id: randomUUID(),
                            userid: userid as string,
                            fileid: `${fileId}.${mime}`,
                            filename: file.name,
                            date: dateString,
                            name: fileId as string,
                            size: file.size,
                            type: mime
                        }
                    }).catch((err: Error) => {
                        req.client.logs.error(err.message);
                        req.client.logs.debug(err.stack as string);

                        return res.status(500).send({
                            status: 'UPLOAD_ERROR',
                            message: err.message
                        })
                    });

                    let replaceHook = user.data.webhook.replace('discord.com', 'proxy.cordx.lol');

                    const { webhooks } = this.client.webhooks;

                    await webhooks.send({
                        userid: userid as string,
                        webhook: replaceHook,
                        link: `${req.client.config.Cordx.domain}/api/user/${userid}/${fileId}.${mime}`,
                        type: mime,
                        info: {
                            size: formattedSize,
                            name: file.name,
                            date: file.lastModifiedDate.toDateString()
                        }
                    });
                }).catch((err: Error) => {
                    req.client.logs.error(err.message);
                    req.client.logs.debug(err.stack as string);

                    return res.status(500).send({
                        status: 'UPLOAD_ERROR',
                        message: err.message
                    })
                })

                return res.status(200).send({
                    status: 'OK',
                    message: 'Successfully uploaded your file!',
                    url: `${getBase(req)}/users/${userid}/${fileId}.${mime}`
                })
            },
            makeId: async (length: number): Promise<string> => {
                return randomBytes(length).toString('hex');
            },
            formatSize: async (bytes: number): Promise<string> => {
                const units = ['byte', 'bytes', 'KB', 'MB', 'GB', 'TB'];
                let index = 0;

                while (bytes >= 1024 && index < units.length - 1) {
                    bytes /= 1024;
                    index++;
                }

                return `${bytes.toFixed(2)} ${units[index]}`;
            }
        }
    }
}