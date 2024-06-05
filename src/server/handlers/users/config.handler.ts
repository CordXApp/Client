import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class ConfigHandler {

    constructor() { }

    public get SharexConfig() {
        return {
            ViewHandler: async (req: FastifyRequest<{ Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId, secret, domain } = req.query;

                let config;

                if (domain) config = await req.client.modules.configs.sharex.generate(userId as string, secret as string, domain as string);
                else config = await req.client.modules.configs.sharex.generate(userId as string, secret as string);

                return res.status(200).send(JSON.stringify(config.data));
            },
            ViewPreHandler: async (req: FastifyRequest<{ Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId, secret } = req.query;

                if (!userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                });

                if (!secret) return res.status(400).send({
                    status: 'MISSING_SECRET',
                    message: 'Please provide a valid secret!',
                    code: 400
                });

                const user = await req.client.db.user.model.fetch(userId);

                if (!user.success) return res.status(404).send({
                    status: 'USER_NOT_FOUND',
                    message: user.message,
                    code: 404
                });

                if (user.data.secret !== secret) return res.status(403).send({
                    status: 'INVALID_SECRET',
                    message: 'Invalid secret provided',
                    code: 403
                });

                if (user.data.banned) return res.status(403).send({
                    status: 'USER_BANNED',
                    message: 'User is banned',
                    code: 403
                });
            },
            DownloadHandler: async (req: FastifyRequest<{ Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId, secret, domain } = req.query;

                let config;

                if (domain) config = await req.client.modules.configs.sharex.generate(userId as string, secret as string, domain as string);
                else config = await req.client.modules.configs.sharex.generate(userId as string, secret as string);

                if (!config.success) return res.status(500).send({
                    status: 'CONFIG_GENERATION_FAILED',
                    message: config.message,
                    code: 500
                });

                const configString = JSON.stringify(config.data, null, 2);

                res.header('Content-Disposition', `attachment; filename="CordX.sxcu"`);
                res.header('Content-Type', 'application/json');

                return res.status(200).send(configString);
            }
        }
    }
}