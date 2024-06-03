import { FastifyInstance } from 'fastify';
import { UserStates } from "../../handlers/users/states.handler";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { States } = new UserStates();

    const Getter: Router = {
        method: 'GET',
        url: '/:userId/states',
        handler: States.Handler,
        preHandler: States.PreHandler,
        //schema: UserStats.Swagger

    }

    fastify.route(Getter)
}