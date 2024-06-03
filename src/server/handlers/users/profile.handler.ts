import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class UserProfileHandler {

    constructor() { }

    public get UserProfile() {
        return {
            Handler: async (req: FastifyRequest<{ Params: GetDiscordUser, Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const user = await req.client.db.user.model.profile(req.params.userId);

                if (!user.success) return res.status(404).send({
                    status: 'USER_NOT_FOUND',
                    message: `${user.message}`,
                    code: 404
                })

                return res.status(200).send(JSON.stringify({
                    id: user.data.userid,
                    avatar: user.data.avatar,
                    banner: user.data.banner,
                    username: user.data.username,
                    globalName: user.data.globalName,
                    secret: user.data.secret,
                    cookie: user.data.cookie,
                    webhook: user.data.webhook,
                    banned: user.data.banned,
                    verified: user.data.verified,
                    domain: user.data.domain,
                    beta: user.data.beta
                }))
            },
            PreHandler: async (req: FastifyRequest<{ Params: GetDiscordUser, Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.params;
                const { secret } = req.query;

                if (!userId) return res.status(400).send({
                    status: 'NO_USER_ID',
                    message: 'No user id provided',
                    code: 400
                });

                const test = await req.client.db.user.model.fetch(userId);

                if (!test.success) return res.status(500).send({
                    status: 'USER_NOT_FOUND',
                    message: test.message,
                    code: 500
                })

                if (!secret && secret !== test.data.secret) return res.status(400).send({
                    status: 'INVALID_SECRET',
                    message: 'Please provide a valid CordX API Secret',
                    code: 400
                })
            },
        }
    }
}