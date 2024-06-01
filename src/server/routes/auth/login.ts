import { FastifyInstance } from 'fastify';
import { LoginHandler } from "../../handlers/auth/login.handler";
import { LoginSchema } from "../../schemas/auth/login.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { Login } = new LoginHandler();

    const Getter: Router = {
        method: 'GET',
        url: '/login',
        handler: Login.Handler,
        schema: LoginSchema.Swagger
    }

    fastify.route(Getter)
}