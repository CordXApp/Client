import { Schema } from "../../../types/server/base.types";

export class ViewSchema {
    public static Swagger: Schema = {
        tags: ['Entities'],
        summary: 'View an entity',
        description: 'View some basic info about an entity!',
        querystring: {
            type: 'object',
            required: ['type', 'id'],
            properties: {
                type: { type: 'string', description: 'The type of entity (user or org).' },
                id: { type: 'string', description: 'The entitie\'s identifier.' }
            }
        },
        response: {
            404: {
                status: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'number' }
            },
            422: {
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