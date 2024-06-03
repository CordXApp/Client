import { FastifyRequest, FastifyReply } from "fastify";
const Formidable = require('formidable-serverless');

export class UserUpload {
    constructor() { }

    public get Create() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {
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
                            error: 'Client aborted the upload request!'
                        }))
                    })

                    form.on('error', async (err: any) => {

                        req.client.logs.error(err.message);
                        req.client.logs.debug(err.stack);

                        reject(res.status(400).send({
                            status: 'UPLOAD_ERROR',
                            error: err.message
                        }))
                    })

                    return form.parse(req.raw, async function (err: any, fields: any, files: any) {

                        if (err) return res.status(500).send({
                            status: 'UPLOAD_ERROR',
                            error: 'An error occurred while processing the upload!'
                        })

                        await req.client.spaces.sharex.handleUpload({
                            req: req,
                            res: res,
                            files: files,
                            userid: userid as string
                        })
                    })
                })
            },
            PreHandler: async (req: FastifyRequest, res: FastifyReply) => {
                const { userid, secret } = req.headers;

                if (!userid || !secret) return res.status(400).send({
                    status: 'INVALID_HEADERS',
                    error: 'Missing required headers!'
                })

                const user = await req.client.db.user.model.fetch(userid as string);

                if (!user.success) return res.status(404).send({
                    status: 'INVALID_USER',
                    error: 'No user with the provided ID was found!'
                })

                if (user.data.secret !== secret) return res.status(401).send({
                    status: 'INVALID_SECRET',
                    error: 'Invalid user secret provided!'
                })

                if (user.data.banned) return res.status(403).send({
                    status: 'USER_BANNED',
                    error: 'User is banned from uploading!'
                })
            }
        }
    }
}