import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class ConfigHandler {

    constructor() { }

    public get SharexConfig() {
        return {
            Handler: async (req: FastifyRequest<{ Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId, secret, domain } = req.query;

                let config;

                if (domain) config = await req.client.configs.sharex.generate(userId as string, secret as string, domain as string);
                else config = await req.client.configs.sharex.generate(userId as string, secret as string);

                return res.status(200).send(JSON.stringify(config.data));
            },
            PreHandler: async (req: FastifyRequest<{ Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId, secret } = req.query;

                if (!userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                });

                if (!secret) return res.status(400).send({
                    message: 'No secret provided',
                    code: 400
                });

                const user = await req.client.db.user.model.fetch(userId);

                if (!user.success) return res.status(404).send({
                    message: user.message,
                    code: 404
                });

                if (user.data.secret !== secret) return res.status(403).send({
                    message: 'Invalid secret provided',
                    code: 403
                });

                if (user.data.banned) return res.status(403).send({
                    message: 'User is banned',
                    code: 403
                });
            }
        }
    }
}