import { Responses } from "../types/database/index";
import { ListObjectsV2CommandOutput, S3 } from "@aws-sdk/client-s3";
import { File, SyncAll, SyncBucket, ActionRes, BucketData } from "../types/spaces/files";
import { DropContentOpts, SpacesClient, SpacesResponse } from "../types/spaces/index";
import type CordX from "../client/cordx"
import { EventEmitter } from "events";
import Logger from "../utils/logger.util"

export class SpacesModule implements SpacesClient {
    public client: CordX;
    public logs: Logger;
    private bucket: S3;
    private action_res: ActionRes;
    public emitter: EventEmitter;
    private marker: string | undefined;
    private truncated: boolean;
    private objects: File[];

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
        this.action_res = {
            synced: 0,
            skipped: 0,
            deleted: 0,
            failed: 0,
            total: 0,
            users: 0,
            muser: 0
        }
        this.truncated = true;
        this.objects = [];
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
            size: (user: string) => {
                return new Promise((resolve, reject) => {

                    const params = {
                        Prefix: `${user}/`,
                        Bucket: 'cordx',
                        Key: `${user}/`
                    }

                    this.bucket.listObjectsV2(params, (err: Error, data?: ListObjectsV2CommandOutput) => {

                        const valid = data?.Contents?.filter(i => i?.Key?.includes(user));

                        if (!valid || valid.length === 0) return reject({
                            success: false,
                            message: `Failed to find bucket for user: ${user}`
                        })

                        if (err) {
                            this.logs.error(`Bucket error: ${err.message}`);
                            this.logs.debug(`Stack trace: ${err.message}`);

                            return reject({
                                success: false,
                                message: `Bucket error: ${err.message}`
                            })
                        }

                        return resolve({
                            success: true,
                            bucket_size: data?.Contents?.map(i => i.Size).reduce((a: any, b: any) => a + b),
                        })
                    })
                })
            }
        }
    }

    public get bucket_db() {
        return {
            /**
             * Drop a specified file or all of a users bucket database content
             * @param {opts.user} string the user to drop file(s) for
             * @param {opts.file} string the fileid to drop (optional)
             * @param {opts.all} boolean default (not yet implemented)
             */
            drop: async (opts: DropContentOpts): Promise<Responses> => {

                let total: number = 0;

                this.logs.info(`Dropping all bucket database content for: ${opts.user}`);

                let { skipped, deleted, failed, muser } = this.action_res;
                const data = await this.client.db.prisma.images.findMany({ where: { userid: opts.user } });
                const list = await this.user.list(opts.user);

                if (!data || !list.success) {
                    muser++;
                    return {
                        success: false,
                        missing: { muser },
                        data: { skipped, deleted, failed }
                    }
                }

                const bucket: File[] = list.data;

                total = data.length;

                if (total === bucket.length || total > 250) {
                    skipped += total;
                    return {
                        success: false,
                        missing: { muser },
                        data: { skipped, deleted, failed }
                    }
                }

                const deletedIds = data.map(file => file.id);

                await this.client.db.prisma.images.deleteMany({ where: { id: { in: deletedIds } } })
                    .then((result) => {
                        deleted += result.count;
                    }).catch((err: Error) => {
                        this.logs.error(`Failed to delete bucket database content for user ${opts.user}: ${err.message}`);
                        failed++;
                    });

                this.logs.debug(`[RESULTS]: Dropped: ${deleted} | Skipped: ${skipped} | Failed: ${failed}`);

                return {
                    success: true,
                    message: `Successfully dropped ${total} files for ${opts.user}`,
                    missing: { muser },
                    data: { skipped, deleted, failed }
                }
            },
            update: async (opts: DropContentOpts) => {

                let { synced, skipped, failed, muser } = this.action_res;
                const list = await this.user.list(opts.user);
                const count = await this.client.db.prisma.images.count({ where: { userid: opts.user } });

                if (!list.success || !count) {
                    muser++;
                    return {
                        success: false,
                        missing: { muser },
                        data: { synced, skipped, failed }
                    }
                }

                this.logs.info(`Resyncing bucket database content for: ${opts.user}`);

                const bucket: File[] = list.data;

                if (bucket.length === count) {
                    skipped += count;
                    return {
                        success: false,
                        missing: { muser },
                        data: { synced, skipped, failed }
                    }
                }

                this.logs.debug(`Uploading ${bucket.length} files to the database for user: ${opts.user}`);

                for (const file of bucket) {

                    const check = await this.client.db.prisma.images.findFirst({ where: { fileid: file.Key.split('/')[1] as string } });

                    /** ensure files aren't duplicated, don't contain a keep file and belong to the user */
                    if (check || file.Key.endsWith('.gitkeep') || !file.Key.includes(opts.user)) {
                        skipped++;
                        continue;
                    }

                    await this.client.db.prisma.images.create({
                        data: {
                            userid: file.Key.split('/')[0] as string,
                            fileid: file.Key.split('/')[1] as string,
                            filename: file.Key.split('/')[1]?.split('.')[0],
                            date: file.LastModified,
                            name: file.Key.split('/')[1]?.split('.')[0],
                            size: file.Size,
                            type: file.Key.split('.')[1]
                        }
                    }).catch((err: Error) => {
                        this.logs.error(`Failed to upload file ${file.Key} to the database: ${err.message}`);
                        failed++;

                        return {
                            success: false,
                            missing: { muser },
                            data: { synced, skipped, failed }
                        }
                    })

                    synced++;
                }

                this.logs.debug(`[RESULTS]: Synced: ${synced} | Skipped: ${skipped} | Failed: ${failed}`);

                return {
                    success: true,
                    message: `Successfully synced ${synced} files for ${opts.user}`,
                    missing: { muser },
                    data: { synced, skipped, failed }
                }
            }
        }
    }

    public get actions() {
        return {
            /**
             * Sync all files in a users bucket
             */
            sync_user: async (user: string): Promise<{ results: SyncBucket }> => {

                this.logs.info(`Starting bucket sync for: ${user}`);

                this.emitter.emit('progress', {
                    message: `Starting bucket sync for: ${user}`,
                    synced: this.action_res.synced,
                    skipped: this.action_res.skipped,
                    deleted: this.action_res.deleted,
                    failed: this.action_res.failed,
                    total: this.action_res.total
                })

                const list = await this.user.list(user);
                const data: File[] = list.data;

                this.action_res.total = data.length;

                this.emitter.emit('progress', {
                    message: `Syncing files for: ${user}`,
                    synced: this.action_res.synced,
                    skipped: this.action_res.skipped,
                    deleted: this.action_res.deleted,
                    failed: this.action_res.failed,
                    total: this.action_res.total
                })

                const bucket: Responses = await this.bucket_db.drop({ user, all: false });

                if (!bucket.success) {
                    this.action_res.failed++;

                    this.emitter.emit('progress', {
                        message: `Failed to clear bucket database for: ${user}`,
                        synced: this.action_res.synced,
                        skipped: this.action_res.skipped,
                        deleted: this.action_res.deleted,
                        failed: this.action_res.failed,
                        total: this.action_res.total
                    })
                }

                this.emitter.emit('progress', {
                    message: `Cleared bucket database for: ${user}, starting re-sync`,
                    synced: this.action_res.synced,
                    skipped: this.action_res.skipped,
                    deleted: this.action_res.deleted,
                    failed: this.action_res.failed,
                    total: this.action_res.total
                })

                const update: Responses = await this.bucket_db.update({ user, all: false });

                if (!update.success) {
                    this.action_res.failed++;

                    this.emitter.emit('progress', {
                        message: `Failed to update bucket database for: ${user}`,
                        synced: this.action_res.synced,
                        skipped: this.action_res.skipped,
                        deleted: this.action_res.deleted,
                        failed: this.action_res.failed,
                        total: this.action_res.total
                    })
                }

                this.emitter.emit('progress', {
                    message: `Updated bucket database for: ${user}, please wait for results...`,
                    synced: this.action_res.synced,
                    skipped: this.action_res.skipped,
                    deleted: this.action_res.deleted,
                    failed: this.action_res.failed,
                    total: this.action_res.total
                })

                this.logs.ready(`Bucket sync complete for user: ${user}`);

                this.action_res.synced += update.data.synced;
                this.action_res.skipped += bucket.data.skipped + update.data.skipped;
                this.action_res.deleted += bucket.data.deleted;
                this.action_res.failed += bucket.data.failed + update.data.failed;
                this.action_res.total = data.length;

                return { results: this.action_res }
            },
            /**
             * Sync all files in the bucket to the database
             * @returns {Promise<SyncAll>}
             */
            sync_all: async (): Promise<{ results: SyncAll }> => {

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

                    const bucket: Responses = await this.bucket_db.drop({ user: user.userid as string, all: true });

                    this.emitter.emit('progress', {
                        synced: 0,
                        skipped: bucket.data.skipped,
                        deleted: bucket.data.deleted,
                        failed: bucket.data.failed,
                        muser: bucket.missing.muser,
                        user: user.userid
                    })

                    const update = await this.bucket_db.update({ user: user.userid as string, all: true });

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
            }
        }
    }
}