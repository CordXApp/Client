import { FastifyInstance } from 'fastify';
import { EightBall } from "../../handlers/client/8ball.handler";
import { EightBallSchema } from "../../schemas/client/8ball.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const Getter: Router = {
        method: 'GET',
        url: '/8ball',
        handler: EightBall.Handler,
        schema: EightBallSchema.Swagger
    }

    fastify.route(Getter);
}