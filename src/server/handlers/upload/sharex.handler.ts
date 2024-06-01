import { FastifyRequest, FastifyReply } from "fastify";
import { readFileSync } from "node:fs";
const Formidable = require('formidable-serverless');
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

export class SharexUploader {
    constructor() { }

    public get sharex() {
        return {
            handler: async (req: FastifyRequest, res: FastifyReply) => {
                const { userid, secret } = req.headers;

                return new Promise(async (resolve, reject) => {
                    const form = new Formidable.IncomingForm({
                        multiples: true,
                        keepExtensions: true,
                        maxFileSize: 6442450944
                    });

                    form.on('aborted', () => {
                        reject(res.status(400).send({
                            status: 'UPLOAD_FAILED',
                            error: 'Client aborted the upload request!',
                            url: '[CORDX]: request aborted'
                        }))
                    })

                    form.on('error', async (err: any) => {

                        req.client.logs.error(err.message);
                        req.client.logs.debug(err.stack);

                        reject(res.status(400).send({
                            status: 'UPLOAD_ERROR',
                            error: err.message,
                            url: '[CORDX]: error occurred'
                        }))
                    })

                    return form.parse(req.raw, async function (err: any, fields: any, files: any) {

                        if (err) return res.status(500).send({
                            status: 'UPLOAD_ERROR',
                            error: 'An error occurred while processing the upload!',
                        })

                        await req.client.spaces.sharex.handleUpload({
                            req: req,
                            res: res,
                            files: files,
                            secret: secret as string,
                            userid: userid as string
                        })
                    })
                })
            },
            preHandler: async (req: FastifyRequest, res: FastifyReply) => {
                const { userid, secret } = req.headers;

                if (!userid || !secret) return res.status(400).send({
                    status: 'INVALID_HEADERS',
                    error: 'Missing required headers!',
                    url: '[CORDX]: missing headers'
                })

                const user = await req.client.db.user.model.fetch(userid as string);

                if (!user.success) return res.status(404).send({
                    status: 'INVALID_USER',
                    error: 'No user with the provided ID was found!',
                    url: '[CORDX]: invalid user'
                })

                if (user.data.secret !== secret) return res.status(401).send({
                    status: 'INVALID_SECRET',
                    error: 'Invalid user secret provided!',
                    url: '[CORDX]: invalid secret'
                })

                if (user.data.banned) return res.status(403).send({
                    status: 'USER_BANNED',
                    error: 'User is banned from uploading!',
                    url: '[CORDX]: user banned'
                })
            }
        }
    }
}