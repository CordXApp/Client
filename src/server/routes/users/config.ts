import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ConfigHandler } from "../../handlers/users/config.handler";
import { GetDiscordUser } from '../../../types/server/param.types';

export default async function (fastify: FastifyInstance) {

    const { SharexConfig } = new ConfigHandler();

    fastify.route({
        method: 'GET',
        url: '/config/view',
        handler: SharexConfig.Handler,
        preHandler: SharexConfig.PreHandler
    })

    fastify.route({
        method: 'GET',
        url: '/config/download',
        handler: async (req: FastifyRequest<{ Querystring: GetDiscordUser }>, res: FastifyReply) => {
            const { userId, secret, domain } = req.query;

            let config;

            if (domain) config = await req.client.configs.sharex.generate(userId as string, secret as string, domain as string);
            else config = await req.client.configs.sharex.generate(userId as string, secret as string);

            if (!config.success) return res.status(500).send({
                status: 'CONFIG_GENERATION_FAILED',
                message: config.message,
                code: 500
            });

            const configString = JSON.stringify(config.data, null, 2);

            res.header('Content-Disposition', 'attachment; filename="CordX.sxcu"');
            res.header('Content-Type', 'application/json');

            return res.send(configString);
        }
    })
}