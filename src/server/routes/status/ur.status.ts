import { FastifyInstance } from 'fastify';
import { UptimeRobot } from "../../handlers/status/ur.handler";
import { UptimeRobot as Uptime } from "../../schemas/status/ur.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {
    const { Status } = new UptimeRobot();

    const Getter: Router = {
        url: '/ur',
        method: 'GET',
        handler: Status.Handler,
        schema: Uptime.Swagger
    }

    fastify.route(Getter);
}