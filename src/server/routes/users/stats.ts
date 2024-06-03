import { FastifyInstance } from 'fastify';
import { UploadStatsHandler } from "../../handlers/users/stats.handler";
import { UserStats } from "../../schemas/users/stats.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { UploadStats } = new UploadStatsHandler();

    const Getter: Router = {
        method: 'GET',
        url: '/:userId/stats',
        handler: UploadStats.Handler,
        preHandler: UploadStats.PreHandler,
        schema: UserStats.Swagger

    }

    fastify.route(Getter)
}