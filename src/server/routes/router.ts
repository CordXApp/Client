import { FastifyInstance } from 'fastify';
import { RootHandler } from '../handlers/home/root.handler';
import { Router } from "../../types/server/base.types";

export default async function (fastify: FastifyInstance) {
    const { Home } = new RootHandler();

    const Getter: Router = {
        url: '/',
        method: 'GET',
        handler: Home.Handler
    }

    fastify.route(Getter);
}