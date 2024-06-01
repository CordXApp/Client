import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ConfigHandler } from "../../handlers/users/config.handler";
import { ViewConfigSchema, DownloadConfigSchema } from "../../schemas/users/config.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { SharexConfig } = new ConfigHandler();

    const Viewer: Router = {
        url: '/config/view',
        method: 'GET',
        handler: SharexConfig.ViewHandler,
        preHandler: SharexConfig.ViewPreHandler,
        schema: ViewConfigSchema.Swagger
    }

    const Downloader: Router = {
        url: '/config/download',
        method: 'GET',
        handler: SharexConfig.DownloadHandler,
        schema: DownloadConfigSchema.Swagger
    }

    fastify.route(Viewer);
    fastify.route(Downloader);
}