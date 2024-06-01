import { FastifyInstance } from 'fastify';
import { DiscordUserHandler } from "../../handlers/users/discord.handler";

export default async function (fastify: FastifyInstance) {

    const { DiscordUser } = new DiscordUserHandler();

    fastify.route({
        method: 'GET',
        url: '/:userId/discord',
        handler: DiscordUser.Handler,
        preHandler: DiscordUser.PreHandler
    })
}