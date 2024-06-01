import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class UploadStatsHandler {

    constructor() { }

    public get UploadStats() {
        return {
            Handler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const stats = await req.client.spaces.stats.profile(req.params.userId);

                return res.status(200).send(JSON.stringify(stats.data))
            },
            PreHandler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                if (!req.params.userId) return res.status(500).send({
                    message: 'No user id provided',
                    code: 500
                });

                const test = await req.client.spaces.stats.profile(req.params.userId);

                if (!test.success) return res.status(500).send({
                    message: test.message,
                    code: 500
                })

            }
        }
    }
}