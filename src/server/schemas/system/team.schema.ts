import { Schema } from "../../../types/server/base.types";

export class TeamSchema {
    public static Swagger: Schema = {
        tags: ['System'],
        summary: 'View a list of our team members',
        description: 'View a list of our team members and their permissions within our system.',
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        avatar: { type: 'string' },
                        banner: { type: 'string' },
                        username: { type: 'string' },
                        globalName: { type: 'string' },
                        permissions: { type: 'array', items: { type: 'string' } }
                    }
                }
            },
        }
    }
}