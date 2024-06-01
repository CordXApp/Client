import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class UserProfileHandler {

    constructor() { }

    public get UserProfile() {
        return {
            Handler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const user = await req.client.db.user.model.profile(req.params.userId);

                if (!user.success) return res.status(404).send({
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
                    banned: user.data.banned,
                    verified: user.data.verified,
                    domain: user.data.domain

                }))
            },
            PreHandler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const { userId, secret } = req.params;

                if (!userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                });

                const test = await req.client.db.user.model.profile(userId);

                if (!test.success) return res.status(500).send({
                    message: test.message,
                    code: 500
                })

                const exists = await req.client.db.secret.model.exists(secret as string);

                if (!secret || !exists) return res.status(400).send({
                    message: 'Please provide a valid CordX API Secret',
                    code: 400
                })
            },
        }
    }
}