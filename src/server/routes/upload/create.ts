import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserUpload } from "../../handlers/upload/create.handler";
import { CreateUpload as Upload } from "../../schemas/upload/create.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { Create } = new UserUpload()

    const Getter: Router = {
        url: '/create',
        method: 'GET',
        handler: (req: FastifyRequest, res: FastifyReply) => {
            return res.status(405).send({
                status: 'INVALID_METHOD',
                message: 'Method Not Allowed',
            })
        }
    }

    const Poster: Router = {
        url: '/create',
        method: 'PUT',
        handler: Create.Handler,
        preHandler: Create.PreHandler,
        schema: Upload.Swagger
    }

    fastify.route(Getter);
    fastify.route(Poster);
}