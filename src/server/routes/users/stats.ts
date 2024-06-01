import { FastifyInstance } from 'fastify';
import { UploadStatsHandler } from "../../handlers/users/stats.handler";

export default async function (fastify: FastifyInstance) {

    const { UploadStats } = new UploadStatsHandler();

    fastify.route({
        method: 'GET',
        url: '/:userId/stats',
        handler: UploadStats.Handler,
        preHandler: UploadStats.PreHandler
    })
}