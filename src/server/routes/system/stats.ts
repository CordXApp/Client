import { FastifyInstance } from 'fastify';
import { SystemStats } from "../../handlers/system/stats.handler";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { Stats } = new SystemStats();

    const Getter: Router = {
        method: 'GET',
        url: '/stats',
        handler: Stats.Handler,
    }

    fastify.route(Getter);
}