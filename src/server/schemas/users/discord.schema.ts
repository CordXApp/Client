import { Schema } from "../../../types/server/base.types";

export class DiscordUserSchema {
    public static Swagger: Schema = {
        tags: ['Users'],
        summary: 'Fetch Discord User',
        description: 'Fetch a users discord account by their user id!',
        params: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    username: { type: 'string' },
                    globalName: { type: 'string' },
                    avatar: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            url: { type: 'string' },
                            gif: { type: 'boolean' }
                        }
                    },
                    banner: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            url: { type: 'string' },
                            color: { type: 'string' },
                            gif: { type: 'boolean' }
                        }
                    },
                }
            },
            400: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            },
            427: {
                status: { type: 'string' },
                message: { type: 'string' },
                error: { type: 'string' },
                code: { type: 'number' }
            },
            429: {
                status: { type: 'string' },
                message: { type: 'string' },
                error: { type: 'string' },
                code: { type: 'number' }
            },
            500: {
                status: { type: 'string' },
                message: { type: 'string' },
                error: { type: 'string' },
                code: { type: 'number' }
            }
        }
    }
}
