import { Schema } from "../../../types/server/base.types";

export class DeleteUpload {
    public static Swagger: Schema = {
        tags: ['Upload'],
        summary: 'Delete a file/image',
        description: 'Delete a file/image from our servers!',
        headers: {
            type: 'object',
            required: ['secret'],
            properties: {
                secret: { type: 'string' }
            }
        },
        body: {
            type: 'object',
            required: ['userid', 'fileid'],
            properties: {
                userid: { type: 'string' },
                fileid: { type: 'string' }
            }
        },
        response: {
            200: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
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