import { FastifyInstance } from 'fastify';
import { CordXTeam } from "../../handlers/system/team.handler";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { Team } = new CordXTeam();

    const Getter: Router = {
        method: 'GET',
        url: '/team',
        handler: Team.Handler,
    }

    fastify.route(Getter);
}