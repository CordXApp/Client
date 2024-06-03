import { FastifyInstance } from 'fastify';
import { CallbackHandler } from "../../handlers/auth/callback.handler";
import { CallbackSchema } from "../../schemas/auth/callback.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { Callback } = new CallbackHandler();

    const Getter: Router = {
        method: 'GET',
        url: '/callback',
        handler: Callback.Handler,
        schema: CallbackSchema.Swagger
    }

    fastify.route(Getter);
}