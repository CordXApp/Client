import { FastifyInstance } from 'fastify';
import { UserProfileHandler } from "../../handlers/users/profile.handler";

export default async function (fastify: FastifyInstance) {

    const { UserProfile } = new UserProfileHandler();

    fastify.route({
        method: 'GET',
        url: '/:userId/:secret',
        handler: UserProfile.Handler,
        preHandler: UserProfile.PreHandler
    })
}