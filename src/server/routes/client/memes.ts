import { FastifyInstance } from 'fastify';
import { MemeHandler } from "../../handlers/client/meme.handler";
import { MemeSchema } from "../../schemas/client/meme.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const Random: Router = {
        method: 'GET',
        url: '/memes/random',
        handler: MemeHandler.Random,
        schema: MemeSchema.Random,
    }

    const Reddit: Router = {
        method: 'GET',
        url: '/memes/reddit',
        handler: MemeHandler.Reddit,
        schema: MemeSchema.Reddit,
    }

    fastify.route(Random);
    fastify.route(Reddit);
}