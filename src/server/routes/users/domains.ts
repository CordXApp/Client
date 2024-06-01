import { FastifyInstance } from 'fastify';
import { UserDomainsHandler } from "../../handlers/users/domains.handler";
import { UserDomains as Domains } from "../../schemas/users/domains.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { UserDomains } = new UserDomainsHandler();

    const Getter: Router = {
        method: 'GET',
        url: '/:userId/domains',
        handler: UserDomains.Handler,
        preHandler: UserDomains.PreHandler,
        schema: Domains.Swagger
    }

    fastify.route(Getter);
}