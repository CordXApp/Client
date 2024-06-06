import { FastifyRequest, FastifyReply } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";
import { randomBytes } from "node:crypto";

export class UserSettings {
    constructor() { }

    public get UpdateSecret() {
        return {
            Handler: async (req: FastifyRequest<{ Body: { length: number }, Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.query;
                const { length } = req.body;

                const updated = await req.client.db.prisma.users.update({
                    where: { userid: userId },
                    data: {
                        secret: randomBytes(length).toString('hex')
                    }
                })

                if (!updated) return res.status(500).send({
                    status: 'INTERNAL_SERVER_ERROR',
                    message: 'An error occurred while updating the API Secret',
                    code: 500
                });

                return res.status(200).send({
                    status: 'SUCCESS',
                    message: 'API Secret updated successfully!',
                    code: 200
                });
            },
            PreHandler: async (req: FastifyRequest<{ Body: { secret: string, length: number }, Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.query;
                const { length } = req.body;
                const { secret } = req.headers;

                if (req.method !== 'PATCH') return res.status(405).send({
                    status: 'METHOD_NOT_ALLOWED',
                    message: 'This endpoint only supports PATCH requests',
                    code: 405
                });

                if (!userId) return res.status(400).send({
                    status: 'NO_USER_ID',
                    message: 'No user id provided',
                    code: 400
                });

                if (!secret) return res.status(400).send({
                    status: 'NO_SECRET',
                    message: 'No secret provided',
                    code: 400
                });

                if (!length) return res.status(400).send({
                    status: 'NO_LENGTH',
                    message: 'Please provide a length for your secret (should be between 32 and 64)',
                    code: 400
                });

                if (length < 32 || length > 64) return res.status(400).send({
                    status: 'INVALID_LENGTH',
                    message: 'Please provide a secret length between 32 and 64',
                    code: 400
                });

                const user = await req.client.db.user.model.fetch(userId);

                if (!user.success) return res.status(404).send({
                    status: 'USER_NOT_FOUND',
                    message: user.message,
                    code: 400
                });

                if (secret !== user.data.secret) return res.status(401).send({
                    status: 'UNAUTHORIZED',
                    message: 'Invalid API Secret provided!',
                    code: 401
                });
            }
        }
    }

    public get UpdateWebhook() {
        return {
            Handler: async (req: FastifyRequest<{ Body: { webhook: string }, Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.query;
                const { webhook } = req.body;

                const updated = await req.client.db.prisma.users.update({
                    where: { userid: userId },
                    data: { webhook }
                })

                if (!updated) return res.status(500).send({
                    status: 'INTERNAL_SERVER_ERROR',
                    message: 'An error occurred while updating the Webhook',
                    code: 500
                });

                return res.status(200).send({
                    status: 'SUCCESS',
                    message: 'Webhook updated successfully!',
                    code: 200
                });
            },
            PreHandler: async (req: FastifyRequest<{ Body: { webhook: string }, Querystring: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.query;
                const { webhook } = req.body;
                const { secret } = req.headers;

                if (req.method !== 'PATCH') return res.status(405).send({
                    status: 'METHOD_NOT_ALLOWED',
                    message: 'This endpoint only supports PATCH requests',
                    code: 405
                });

                if (!secret) return res.status(400).send({
                    status: 'NO_SECRET',
                    message: 'No secret provided',
                    code: 400
                });

                if (!userId) return res.status(400).send({
                    status: 'NO_USER_ID',
                    message: 'No user id provided',
                    code: 400
                });

                if (!webhook) return res.status(400).send({
                    status: 'NO_WEBHOOK',
                    message: 'No webhook provided',
                    code: 400
                });

                const user = await req.client.db.user.model.fetch(userId);

                if (!user.success) return res.status(404).send({
                    status: 'USER_NOT_FOUND',
                    message: user.message,
                    code: 400
                });

                if (secret !== user.data.secret) return res.status(401).send({
                    status: 'UNAUTHORIZED',
                    message: 'Invalid API Secret provided!',
                    code: 401
                });

                if (!webhook.startsWith('https://discord.com/api/webhooks')) return res.status(400).send({
                    status: 'INVALID_WEBHOOK',
                    message: 'Invalid webhook provided',
                    code: 400
                });

                const test = await fetch(webhook);

                if (test.status !== 200) return res.status(400).send({
                    status: 'INVALID_WEBHOOK',
                    message: 'Invalid webhook provided',
                    code: 400
                });

                if (webhook === user.data.webhook) return res.status(400).send({
                    status: 'WEBHOOK_ALREADY_SET',
                    message: 'Webhook is already set to this value',
                    code: 400
                });
            }
        }
    }
}