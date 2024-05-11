import { ListObjectsV2CommandOutput, S3 } from "@aws-sdk/client-s3";
import type CordX from "../client/cordx"
import { EventEmitter } from "events";
import Logger from "../utils/logger.util"

import {
    File,
    EmitterResponse,
    DropContentOpts,
    SpacesClient,
    SpacesResponse,
    UpdateContentOpts
} from "../types/modules/spaces";

export class Spaces implements SpacesClient {
    private client: CordX;
    public logs: Logger;
    private bucket: S3;
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

                this.logs.info(`Dropping bucket database content for: ${opts.user}`);

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
                    this.logs.debug(`Bucket content for: ${opts.user} is in sync, canacelling operation!`);
                    return {
                        success: false,
                        message: `Your bucket is already in-sync, cancelling operation!`
                    }
                }

                if (!opts.force && data.length > 250) {
                    this.logs.debug(`Bucket content for: ${opts.user} exceeds 250 total files, cancelling delete operation!`);
                    this.logs.info(`You can force this action to continue by re-executing it using the \`force: true\` flag`);

                    return {
                        success: false,
                        message: 'Your bucket content exceeds the allowed 250 files, deletion will be skipped!'
                    }
                }

                const deletedIds: any = data.map(file => file.id);

                this.logs.debug(`Bucket database content deletion: ${this.currentPercentage.toFixed(0)}% complete`)
                for (let i = 0; i < deletedIds.length; i++) {
                    await this.client.db.prisma.images.delete({ where: { id: deletedIds[i] } })
                        .then(() => {
                            this.currentPercentage = ((i + 1) / deletedIds.length) * 100;
                            let roundedPercentage = Math.round(this.currentPercentage);
                            if (roundedPercentage % 10 === 0 && roundedPercentage !== this.lastPercentage) {
                                this.logs.debug(`Bucket database content deletion: ${this.currentPercentage.toFixed(0)}% complete`);
                                this.lastPercentage = roundedPercentage;

                                this.emitter.emit('progress', {
                                    message: 'Dropping your database bucket content, this may take some time but i will update the progress below when necessary!',
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

                this.logs.debug(`Successfully wiped bucket database content for user: ${opts.user}`);

                return { success: true }
            },
            update: async (opts: UpdateContentOpts): Promise<SpacesResponse> => {

                this.currentPercentage = 0;
                this.lastPercentage = 0;

                this.logs.info(`Syncing bucket database content for: ${opts.user}`);

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
                        this.logs.debug(`Skipping file ${file?.Key.split('/')[1]} as it already exists`);
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
                            if (roundedPercentage % 10 === 0 && roundedPercentage !== this.lastPercentage) {
                                this.logs.debug(`Bucket database content upload: ${this.currentPercentage.toFixed(0)}% complete`);
                                this.lastPercentage = roundedPercentage;

                                this.emitter.emit('progress', {
                                    message: 'Uploading bucket content to our database, this may take some time but i will update the progress below when necessary!',
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

                this.logs.ready(`Successfully synced bucket with database for: ${opts.user}`)

                return { success: true }
            }
        }
    }

    public get actions() {
        return {
            sync_user: async (user: string): Promise<EmitterResponse> => {

                this.logs.info(`Starting bucket sync operation for: ${user}`);

                const list = await this.user.list(user);

                if (!list.success) return {
                    results: {
                        success: false,
                        message: 'Unable to locate your bucket, do you have a CordX Profile and have you uploaded any content?'
                    }
                }

                const drop: SpacesResponse = await this.bucket_db.drop({ user, force: true });

                if (!drop.success) {
                    return {
                        results: {
                            success: false,
                            message: drop.message
                        }
                    }
                }

                const update: SpacesResponse = await this.bucket_db.update({ user, force: true });

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
            }
            /**
             * Sync all files in the bucket to the database
             * @returns {Promise<SyncAll>}
             */
            /**sync_all: async (): Promise<{ results: SyncAll }> => {

                const users = await this.client.db.prisma.users.findMany();

                this.action_res.users = users.length;

                this.logs.info(`Starting bucket sync for ${users.length} users!`);

                for (const user of users) {

                    this.emitter.emit('progress', {
                        synced: 0,
                        skipped: 0,
                        deleted: 0,
                        failed: 0,
                        muser: 0,
                        user: user.userid
                    })

                    const bucket: Responses = await this.bucket_db.drop({ user: user.userid as string });

                    this.emitter.emit('progress', {
                        synced: 0,
                        skipped: bucket.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed,
                        muser: bucket.missing.muser,
                        user: user.userid
                    })

                    const update = await this.bucket_db.update({ user: user.userid as string });

                    this.emitter.emit('progress', {
                        synced: update.data.synced,
                        skipped: bucket.data.skipped + update.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed + update.data.failed,
                        muser: bucket.missing.muser,
                        user: user.userid
                    })

                    if (!update.success) {
                        this.action_res.muser++;

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

                    this.action_res.synced += update.data.synced;
                    this.action_res.skipped += bucket.data.skipped + update.data.skipped;
                    this.action_res.deleted += bucket.data.deleted;
                    this.action_res.failed += bucket.data.failed + update.data.failed;
                    this.action_res.muser += update.missing.muser;

                    this.logs.debug(`Synced: ${this.action_res.synced} | Skipped: ${this.action_res.skipped} | Deleted: ${this.action_res.deleted} | Failed: ${this.action_res.failed} | Missing: ${this.action_res.muser}`);
                    this.logs.ready(`All available buckets have been synced!`);
                }

                return { results: this.action_res }
            }*/
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
}