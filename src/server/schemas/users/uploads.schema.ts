import { Schema } from "../../../types/server/base.types";

export class UserUploads {
    public static Swagger: Schema = {
        tags: ['Users'],
        summary: 'View a users uploads',
        description: 'View a users uploads by their user ID',
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
                    uploads: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                Key: { type: 'string' },
                                LastModified: { type: 'string' },
                                ETag: { type: 'string' },
                                Size: { type: 'number' },
                                StorageClass: { type: 'string' },
                                Owner: {
                                    type: 'object',
                                    properties: {
                                        DisplayName: { type: 'string' },
                                        ID: { type: 'string' }
                                    }
                                }
                            }
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