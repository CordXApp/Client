import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
    fastify.route({
        method: 'GET',
        url: '/advice',
        handler: async (request, reply) => {
            reply.header('Content-Type', 'application/json');

            const response = await request.client.funmod.generate.Advice();

            return reply.code(200).send({ response });
        }
    })
}