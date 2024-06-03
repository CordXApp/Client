import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { DeleteHandler } from "../../handlers/uploads/delete.handler";
import { DeleteUpload as Delete } from "../../schemas/uploads/delete.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { DeleteUpload } = new DeleteHandler()

    const Getter: Router = {
        url: '/delete',
        method: 'GET',
        handler: (req: FastifyRequest, res: FastifyReply) => {
            return res.status(405).send({
                status: 'INVALID_METHOD',
                message: 'Method Not Allowed',
            })
        }
    }

    const Poster: Router = {
        url: '/delete',
        method: 'DELETE',
        handler: DeleteUpload.Handler,
        preHandler: DeleteUpload.PreHandler,
        schema: Delete.Swagger
    }

    fastify.route(Getter);
    fastify.route(Poster);
}