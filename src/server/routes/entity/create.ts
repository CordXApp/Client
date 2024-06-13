import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { EntityCreator } from "../../handlers/entity/create.handler";
import { CreateSchema } from "../../schemas/entity/create.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { CreateEntity } = new EntityCreator()

    const Getter: Router = {
        url: '/create',
        method: 'POST',
        handler: CreateEntity.Handler,
        preHandler: CreateEntity.PreHandler,
        schema: CreateSchema.Swagger
    }

    fastify.route(Getter);
}