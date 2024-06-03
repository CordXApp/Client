import { Schema } from "../../../types/server/base.types";

export class UserProfile {
    public static Swagger: Schema = {
        tags: ['Users'],
        summary: 'View a Users Profile',
        description: 'Fetch a users profile information!',
        params: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string' }
            }
        },
        querystring: {
            type: 'object',
            required: ['secret'],
            properties: {
                secret: { type: 'string' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    avatar: { type: 'string' },
                    banner: { type: 'string' },
                    username: { type: 'string' },
                    globalName: { type: 'string' },
                    secret: { type: 'string' },
                    cookie: { type: 'string' },
                    banned: { type: 'boolean' },
                    verified: { type: 'boolean' },
                    domain: { type: 'string' },
                    beta: { type: 'boolean' }
                }
            },
            400: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            },
            404: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            },
            500: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            }
        }
    }
}
