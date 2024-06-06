import { FastifyInstance } from 'fastify';
import { UpdateSettingsSchema } from "../../schemas/users/settings.schema";
import { UserSettings } from "../../handlers/users/settings.handler";
import { Router } from "../../../types/server/base.types";

export default async function (fastify: FastifyInstance) {

    const { UpdateSecret, UpdateWebhook } = new UserSettings();

    const SecretUpdate: Router = {
        method: 'PATCH',
        url: '/:userId/settings/secret',
        handler: UpdateSecret.Handler,
        preHandler: UpdateSecret.PreHandler,
        schema: UpdateSettingsSchema.UpdateSecret
    }

    const WebhookUpdate: Router = {
        method: 'PATCH',
        url: '/:userId/settings/webhook',
        handler: UpdateWebhook.Handler,
        preHandler: UpdateWebhook.PreHandler,
        schema: UpdateSettingsSchema.UpdateWebhook
    }

    fastify.route(SecretUpdate);
    fastify.route(WebhookUpdate);
}