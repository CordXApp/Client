import { FastifyInstance } from 'fastify';
import { UserUploadsHandler } from "../../handlers/users/uploads.handler";

export default async function (fastify: FastifyInstance) {

    const { UserUploads } = new UserUploadsHandler();

    fastify.route({
        method: 'GET',
        url: '/:userId/uploads',
        handler: UserUploads.Handler,
        preHandler: UserUploads.PreHandler
    })
}