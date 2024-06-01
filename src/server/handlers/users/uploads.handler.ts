import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class UserUploadsHandler {

    constructor() { }

    public get UserUploads() {
        return {
            Handler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                const uploads = await req.client.spaces.user.list(req.params.userId);

                return res.status(200).send({
                    uploads: uploads.data.splice(Math.floor(Math.random() * uploads.data.length), 9)
                })
            },
            PreHandler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                if (!req.params.userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                });

                const test = await req.client.spaces.user.list(req.params.userId);

                if (!test.success) return res.status(404).send({
                    message: test.message,
                    code: 404
                })
            }
        }
    }
}