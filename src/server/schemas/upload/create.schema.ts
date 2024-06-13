import { Schema } from "../../../types/server/base.types";

export class CreateUpload {
    public static Swagger: Schema = {
        tags: ['Upload'],
        summary: 'Upload a file/image',
        description: `Upload a file/image to our servers (requires a FileForm Name of "cordx")!`,
        headers: {
            type: 'object',
            required: ['entity', 'entityId', 'secret'],
            properties: {
                entity: { type: 'string' },
                entityId: { type: 'string' },
                secret: { type: 'string' }
            }
        },
        response: {
            200: {
                status: { type: 'string' },
                message: { type: 'string' },
                url: { type: 'string' }
            },
            400: {
                status: { type: 'string' },
                message: { type: 'string' }
            },
            403: {
                status: { type: 'string' },
                message: { type: 'string' }
            },
            404: {
                status: { type: 'string' },
                message: { type: 'string' }
            },
            500: {
                status: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
}