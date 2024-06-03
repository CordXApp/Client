import { FastifyInstance } from 'fastify';
import { UserProfileHandler } from "../../handlers/users/profile.handler";
import { UserProfile as Profile } from "../../schemas/users/profile.schema";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { UserProfile } = new UserProfileHandler();

    const Getter: Router = {
        method: 'GET',
        url: '/:userId/profile',
        handler: UserProfile.Handler,
        preHandler: UserProfile.PreHandler,
        schema: Profile.Swagger
    }

    fastify.route(Getter);
}