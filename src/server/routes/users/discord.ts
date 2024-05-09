import { FastifyInstance } from 'fastify';
import { UserHandler } from "../../handlers/users/user.handler";

export default async function (fastify: FastifyInstance) {

    const { handler, preHandler } = new UserHandler();

    fastify.route({
        method: 'GET',
        url: '/:userId/discord',
        handler: handler.getDiscordUser,
        preHandler: preHandler.getDiscordUser
    })
}