import { Schema } from "../../../types/server/base.types";

export class UserDomains {
    public static Swagger: Schema = {
        tags: ['Users'],
        summary: 'Fetch a Users Domains',
        description: 'Fetch a list of all the users registered domains!',
        params: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string' }
            }
        },
        response: {
            200: {
                type: 'array',
                properties: {
                    domains: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            created: { type: 'string' },
                            verified: { type: 'boolean' }
                        }
                    }
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
            }
        }
    }
}
