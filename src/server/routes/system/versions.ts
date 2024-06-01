import { FastifyInstance } from 'fastify';
import { VersionHandler } from "../../handlers/system/versions";

export default async function (fastify: FastifyInstance) {

    const { Versions } = new VersionHandler();

    fastify.route({
        method: 'GET',
        url: '/versions',
        handler: Versions.Handler,
        preHandler: Versions.PreHandler
    })
}