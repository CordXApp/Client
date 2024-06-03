import { Schema } from "../../../types/server/base.types";

export class CallbackSchema {
    public static Swagger: Schema = {
        tags: ['Auth'],
        summary: 'Callback endpoint',
        description: 'Callback endpoint for authentication (custom domains will need to be verified)',
        response: {
            400: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'number' }
                }
            },
            403: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'number' }
                }
            },
            500: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'number' }
                }
            }
        }
    }
}