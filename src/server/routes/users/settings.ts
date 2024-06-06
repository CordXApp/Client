import { FastifyInstance } from 'fastify';
import { UserSettings } from "../../handlers/users/settings.handler";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { UpdateSecret, UpdateWebhook } = new UserSettings();

    const SecretUpdate: Router = {
        method: 'GET',
        url: '/:userId/settings/secret',
        handler: UpdateSecret.Handler,
        preHandler: UpdateSecret.PreHandler
    }

    const WebhookUpdate: Router = {
        method: 'PATCH',
        url: '/:userId/settings/webhook',
        handler: UpdateWebhook.Handler,
        preHandler: UpdateWebhook.PreHandler
    }

    fastify.route(SecretUpdate);
    fastify.route(WebhookUpdate);
}