import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { EntityViewer } from "../../handlers/entity/view.handler";
import { ViewSchema } from "../../schemas/entity/view.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { ViewEntity } = new EntityViewer()

    const Getter: Router = {
        url: '/view',
        method: 'GET',
        handler: ViewEntity.Handler,
        preHandler: ViewEntity.PreHandler,
        schema: ViewSchema.Swagger
    }

    fastify.route(Getter);
}