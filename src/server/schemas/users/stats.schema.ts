import { Schema } from "../../../types/server/base.types";

export class UserStats {
    public static Swagger: Schema = {
        tags: ['Users'],
        summary: 'View a Users CordX Stats',
        description: 'Fetch a users CordX statistics and info!',
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
                    storage: {
                        type: 'object',
                        properties: {
                            bucket: { type: 'string' },
                            database: { type: 'string' }
                        }
                    },
                    files: {
                        type: 'object',
                        properties: {
                            total: { type: 'number' },
                            png: { type: 'number' },
                            gif: { type: 'number' },
                            mp4: { type: 'number' },
                            other: { type: 'number' }
                        }
                    },
                }
            },
            500: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            }
        }
    }
}