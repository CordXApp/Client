import { FastifyInstance } from 'fastify';
import { Advice } from "../../handlers/client/advice.handler";
import { AdviceSchema } from "../../schemas/client/advice.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const Getter: Router = {
        method: 'GET',
        url: '/advice',
        handler: Advice.Handler,
        schema: AdviceSchema.Swagger
    }

    fastify.route(Getter);
}