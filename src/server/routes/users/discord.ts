import { FastifyInstance } from 'fastify';
import { DiscordUserHandler } from "../../handlers/users/discord.handler";
import { DiscordUserSchema } from "../../schemas/users/discord.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { DiscordUser } = new DiscordUserHandler();

    const Getter: Router = {
        url: '/:userId/discord',
        method: 'GET',
        handler: DiscordUser.Handler,
        preHandler: DiscordUser.PreHandler,
        schema: DiscordUserSchema.Swagger
    }

    fastify.route(Getter);
}