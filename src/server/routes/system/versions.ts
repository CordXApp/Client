import { FastifyInstance } from 'fastify';
import { VersionHandler } from "../../handlers/system/versions";

export default async function (fastify: FastifyInstance) {

    const { versions } = new VersionHandler();

    fastify.route({
        method: 'GET',
        url: '/versions',
        handler: versions.handler,
        preHandler: versions.preHandler
    })
}