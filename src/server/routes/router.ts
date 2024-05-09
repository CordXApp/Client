import { FastifyInstance } from 'fastify';
import { RootHandler } from '../handlers/home/root.handler';
import { RootSchema } from '../../types/server/res.types';

export default async function (fastify: FastifyInstance) {

    const { base } = new RootHandler();

    fastify.route({
        method: 'GET',
        url: '/',
        handler: base.root,
        schema: {
            response: RootSchema
        }
    })
}