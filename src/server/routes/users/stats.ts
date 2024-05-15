import { FastifyInstance } from 'fastify';
import { UserHandler } from "../../handlers/users/user.handler";

export default async function (fastify: FastifyInstance) {

    const { handler, preHandler } = new UserHandler();

    fastify.route({
        method: 'GET',
        url: '/:userId/stats',
        handler: handler.getUserUploadStats,
        preHandler: preHandler.getUserUploadStats
    })
}