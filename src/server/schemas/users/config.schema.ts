import { Schema } from "../../../types/server/base.types";

export class ViewConfigSchema {
    public static Swagger: Schema = {
        tags: ['Users'],
        summary: 'View ShareX Config',
        description: 'View your ShareX config for uploading files!',
        querystring: {
            type: 'object',
            required: ['userId', 'secret'],
            properties: {
                userId: { type: 'string' },
                secret: { type: 'string' },
                domain: { type: 'string' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    Version: { type: 'string' },
                    Name: { type: 'string' },
                    DestinationType: { type: 'string' },
                    RequestMethod: { type: 'string' },
                    RequestURL: { type: 'string' },
                    Headers: { type: 'object' },
                    Body: { type: 'string' },
                    FileFormName: { type: 'string' },
                    URL: { type: 'string' }
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

export class DownloadConfigSchema {
    public static Swagger: Schema = {
        tags: ['Users'],
        summary: 'Download ShareX Config',
        description: 'Download your ShareX config for uploading files!',
        querystring: {
            type: 'object',
            required: ['userId', 'secret'],
            properties: {
                userId: { type: 'string' },
                secret: { type: 'string' },
                domain: { type: 'string' }
            }
        },
        response: {
            500: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            }
        }
    }
}