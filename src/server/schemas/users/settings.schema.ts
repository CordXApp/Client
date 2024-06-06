import { Schema } from "../../../types/server/base.types";

export class UpdateSettingsSchema {
    public static UpdateSecret: Schema = {
        tags: ['Users'],
        summary: 'Update a user\'s API Secret',
        description: 'Update a user\'s API Secret, it is recommended that all users do this after our update as this provides a more secure hex string.',
        headers: {
            type: 'object',
            required: ['secret'],
            properties: {
                secret: { type: 'string', description: 'The users current API Secret' }
            }
        },
        querystring: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string', description: 'The users Discord ID' }
            }
        },
        body: {
            type: 'object',
            required: ['length'],
            properties: {
                length: { type: 'number', description: 'Should be between 32 and 64.' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'number' }
                }
            },
            400: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            },
            403: {
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

    public static UpdateWebhook: Schema = {
        tags: ['Users'],
        summary: 'Update a users upload webhook!',
        description: 'Update a users upload webhook, this will be used to send a POST request to your server when a file is uploaded (currently only discord webhooks are supported).',
        headers: {
            type: 'object',
            required: ['secret'],
            properties: {
                secret: { type: 'string', description: 'The users API Secret' }
            }
        },
        querystring: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string', description: 'The users Discord ID' }
            }
        },
        body: {
            type: 'object',
            required: ['webhook'],
            properties: {
                webhook: { type: 'string', description: 'The webhook to set!' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'number' }
                }
            },
            400: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            },
            403: {
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