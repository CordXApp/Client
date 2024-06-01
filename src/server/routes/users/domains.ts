import { FastifyInstance } from 'fastify';
import { UserDomainsHandler } from "../../handlers/users/domains.handler";

export default async function (fastify: FastifyInstance) {

    const { UserDomains } = new UserDomainsHandler();

    fastify.route({
        method: 'GET',
        url: '/:userId/domains',
        handler: UserDomains.Handler,
        preHandler: UserDomains.PreHandler
    })
}