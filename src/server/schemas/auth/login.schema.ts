import { Schema } from "../../../types/server/base.types";

export class LoginSchema {
    public static Swagger: Schema = {
        tags: ['Auth'],
        summary: 'Login endpoint',
        description: 'Login endpoint for authentication',
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