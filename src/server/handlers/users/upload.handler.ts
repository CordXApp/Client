import { FastifyRequest, FastifyReply } from "fastify";
const Formidable = require('formidable-serverless');
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export class UserUpload {
    constructor() { }

    public get Create() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {
                const { userid } = req.headers;

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

                        if (!files) return res.status(500).send({
                            status: 'UPLOAD_FAILED',
                            message: 'No files were uploaded!'
                        })

                        if (err) return res.status(500).send({
                            status: 'UPLOAD_ERROR',
                            message: 'An error occurred while processing the upload!'
                        })

                        await req.client.modules.spaces.sharex.handleUpload({
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

    public get Delete() {
        return {
            Handler: async (req: FastifyRequest<{ Body: { userid: string, fileid: string } }>, res: FastifyReply) => {
                const { userid, fileid } = req.body;

                const user = await req.client.db.user.model.fetch(userid as string);

                const file = await req.client.db.prisma.images.findFirst({
                    where: { fileid: fileid as string }
                });

                if (!file) return res.status(404).send({
                    status: 'FILE_NOT_FOUND',
                    message: 'The file you are trying to delete does not exist',
                    code: 404
                });

                await req.client.db.prisma.images.delete({ where: { id: file.id } }).catch((err: Error) => {
                    req.client.logs.error(err.message);
                    req.client.logs.debug(err.stack as string);

                    return res.status(500).send({
                        status: 'INTERNAL_SERVER_ERROR',
                        message: `Error: ${err.message}`,
                        code: 500
                    });
                });

                const params = {
                    Bucket: 'cordx',
                    Key: `${user.data.userid}/${fileid}`
                }

                await req.client.modules.spaces.bucket.send(new DeleteObjectCommand(params)).catch((err: Error) => {
                    req.client.logs.error(err.message);
                    req.client.logs.debug(err.stack as string);

                    return res.status(500).send({
                        status: 'INTERNAL_SERVER_ERROR',
                        message: `Error: ${err.message}`,
                        code: 500
                    });
                })

                return res.status(200).send({
                    status: 'DELETED_FILE',
                    message: 'The file has been deleted successfully',
                    code: 200
                });
            },
            PreHandler: async (req: FastifyRequest<{ Body: { userid: string, fileid: string } }>, res: FastifyReply) => {
                const { secret } = req.headers;
                const { userid, fileid } = req.body;

                if (!userid) return res.status(400).send({
                    status: 'MISSING_USERID',
                    message: 'Missing userid in headers',
                    code: 400
                });

                if (!secret) return res.status(400).send({
                    status: 'MISSING_SECRET',
                    message: 'Missing secret in headers',
                    code: 400
                });

                if (!fileid) return res.status(400).send({
                    status: 'MISSING_FILEID',
                    message: 'Missing fileid in headers',
                    code: 400
                });

                if (!fileid.includes('.')) return res.status(400).send({
                    status: 'INVALID_FILEID',
                    message: 'The fileid provided is invalid and should include a file extension!',
                    code: 400
                });

                const user = await req.client.db.user.model.fetch(userid as string);

                if (!user.success) return res.status(404).send({
                    status: 'USER_NOT_FOUND',
                    message: 'Whoops, the provided user can not be located in our database',
                    code: 404
                });

                if (user.data.secret !== secret) return res.status(403).send({
                    status: 'INVALID_SECRET',
                    message: 'The secret provided is invalid',
                    code: 403
                });
            }
        }
    }
}