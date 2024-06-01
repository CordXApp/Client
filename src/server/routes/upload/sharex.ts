import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SharexUploader } from "../../handlers/upload/sharex.handler";

export default async function (fastify: FastifyInstance) {

    const { sharex } = new SharexUploader()

    fastify.route({
        method: 'GET',
        url: '/sharex',
        handler: (req: FastifyRequest, res: FastifyReply) => {
            return res.status(405).send({
                status: 'INVALID_METHOD',
                message: 'Invalid method. Please use POST method instead.',
            })
        }
    })

    fastify.route({
        method: 'POST',
        url: '/sharex',
        handler: sharex.handler,
        preHandler: sharex.preHandler
    })
}