import { FastifyRequest, FastifyReply } from "fastify";
import { HandleDeleteParams } from "../../../types/server/upload.types";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export class DeleteHandler {
    constructor() { }

    public get DeleteUpload() {
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