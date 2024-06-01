import { FastifyInstance } from 'fastify';
import { VersionHandler } from "../../handlers/system/versions";
import { VersionsSchema } from "../../schemas/system/versions.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { Versions } = new VersionHandler();

    const Getter: Router = {
        method: 'GET',
        url: '/versions',
        handler: Versions.Handler,
        preHandler: Versions.PreHandler,
        schema: VersionsSchema.Swagger
    }

    fastify.route(Getter);
}