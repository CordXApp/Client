import { FastifyInstance } from 'fastify';
import { ConfigHandler } from "../../handlers/users/config.handler";

export default async function (fastify: FastifyInstance) {

    const { SharexConfig } = new ConfigHandler();

    fastify.route({
        method: 'GET',
        url: '/config/view',
        handler: SharexConfig.Handler,
        preHandler: SharexConfig.PreHandler
    })
}