import { File, FileObj, BucketData } from "../types/spaces/files";
import { ListObjectsCommandOutput, ListObjectsV2CommandOutput, S3 } from "@aws-sdk/client-s3";
import type CordX from "../client/CordX"
import Logger from "../utils/Logger"
import { promisify } from "util";

export class SpacesModule {
    public client: CordX;
    public logs: Logger;
    private bucket: S3;

    constructor(client: CordX) {
        this.client = client;
        this.logs = new Logger("Spaces");
        this.bucket = new S3({
            forcePathStyle: false,
            endpoint: 'https://nyc3.digitaloceanspaces.com',
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.SPACES_KEY as string,
                secretAccessKey: process.env.SPACES_SECRET as string
            }
        })
    }

    public get stats() {
        return {
            /**
             * Determine how much bucket storage is being used by a specified user!
             * @param {user} string The user to determine usage for
             * @returns {Promise<FileObj>} 
             */
            storage: (user: string): void => {
                new Promise((resolve, reject) => {

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
}