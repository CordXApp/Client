import { Schema } from "../../../types/server/base.types";

export class VersionsSchema {
    public static Swagger: Schema = {
        tags: ['System'],
        summary: 'View system versions',
        description: 'View all of our system versions based on their branches (current, stable, newest)!',
        querystring: { branch: { type: 'string' } },
        response: {
            200: {
                api: { type: 'string' },
                bot: { type: 'string' },
                docs: { type: 'string' },
                dns: { type: 'string' },
                proxy: { type: 'string' },
                web: { type: 'string' }
            },
            400: {
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