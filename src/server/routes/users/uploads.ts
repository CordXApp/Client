import { FastifyInstance } from 'fastify';
import { UserUploadsHandler } from "../../handlers/users/uploads.handler";
import { UserUploads as Uploads } from "../../schemas/users/uploads.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { UserUploads } = new UserUploadsHandler();

    const Getter: Router = {
        method: 'GET',
        url: '/:userId/uploads',
        handler: UserUploads.Handler,
        preHandler: UserUploads.PreHandler,
        schema: Uploads.Swagger
    }

    fastify.route(Getter);
}