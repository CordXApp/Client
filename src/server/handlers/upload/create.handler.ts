import { FastifyRequest, FastifyReply } from "fastify";
const Formidable = require('formidable-serverless');

export class UserUpload {
    constructor() { }

    public get Create() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {
                const { entity, entityId } = req.headers;

                if (entity !== 'User' && entity !== 'Organization') return res.status(400).send({
                    status: 'INVALID_ENTITY',
                    error: 'Entity header should be one of: User, Organization'
                })

                if (entity === 'User' && !entityId) return res.status(400).send({
                    status: 'INVALID_HEADERS',
                    error: 'Please provide a valid Discord User ID in the "userId" header'
                })

                if (entity === 'Organization' && !entityId) return res.status(400).send({
                    status: 'INVALID_HEADERS',
                    message: 'Please provide a valid CordX Organization ID in the "orgId" header'
                })

                return new Promise(async (resolve, reject) => {
                    const form = new Formidable.IncomingForm({
                        multiples: true,
                        keepExtensions: true,
                        maxFileSize: 6442450944
                    });

                    form.on('aborted', () => {
                        reject(res.status(400).send({
                            status: 'UPLOAD_FAILED',
                            message: 'Client aborted the upload request!'
                        }))
                    })

                    form.on('error', async (err: any) => {

                        req.client.logs.error(err.message);
                        req.client.logs.debug(err.stack);

                        reject(res.status(400).send({
                            status: 'UPLOAD_ERROR',
                            message: err.message
                        }))
                    })

                    return form.parse(req.raw, async function (err: any, fields: any, files: any) {

                        if (!files) return res.status(500).send({
                            status: 'UPLOAD_FAILED',
                            message: 'No files were uploaded!'
                        })

                        if (err) return res.status(500).send({
                            status: 'UPLOAD_ERROR',
                            message: 'An error occurred while processing the upload!'
                        })

                        await req.client.db.modules.spaces.sharex.entityUploader({
                            req: req,
                            res: res,
                            files: files,
                            entity: entity,
                            entityId: entityId as string
                        })
                    })
                })
            },
            PreHandler: async (req: FastifyRequest, res: FastifyReply) => {
                const { entity, entityId, secret } = req.headers;
                let test;

                if (!entity || !entityId || !secret) return res.status(400).send({
                    status: 'INVALID_HEADERS',
                    message: 'Missing required headers!'
                })

                if (entity === 'User') test = await req.client.db.entity.fetch({ entity: 'User', entityId: entityId as string })
                else if (entity === 'Organization') test = await req.client.db.entity.fetch({ entity: 'Organization', entityId: entityId as string });

                if (!test.success) return res.status(404).send({
                    status: 'INVALID_ENTITY',
                    message: test.message as string
                })

                const decryptedSecret = await req.client.db.secret.model.decrypt(test.data.secret);

                if (decryptedSecret !== secret) return res.status(401).send({
                    status: 'INVALID_SECRET',
                    message: 'Whoops, the secret you provided does not match the one that belongs to this entity!'
                })

                if (test.data.banned) return res.status(403).send({
                    status: 'ENTITY_BANNED',
                    message: 'Entity is banned from uploading, please contact support at: https://cordximg.host/discord'
                })
            }
        }
    }
}