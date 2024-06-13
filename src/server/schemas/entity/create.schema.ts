import { Schema } from "../../../types/server/base.types";

export class CreateSchema {
    public static Swagger: Schema = {
        tags: ['Entities'],
        summary: 'Create an entity',
        description: 'Create either a user or organization entity!',
        querystring: {
            type: 'object',
            required: ['entity'],
            properties: {
                entity: { type: 'string', description: 'The type of entity (user or org).' },
            }
        },
        body: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    description: 'Object containing the users data.',
                    properties: {
                        userid: { type: 'string', description: 'The users discord snowflake/ID.' },
                        avatar: { type: 'string', description: 'The users absolute avatar url.' },
                        banner: { type: 'string', description: 'The users absolute banner url.' },
                        username: { type: 'string', description: 'The users discord username.' },
                        globalName: { type: 'string', description: 'The users discord global name' },
                    }
                },
                org: {
                    type: 'object',
                    description: 'Object containing the orgs data.',
                    properties: {
                        name: { type: 'string', description: 'The organizations name' },
                        logo: { type: 'string', description: 'The organizations logo url' },
                        banner: { type: 'string', description: 'The organizations banner url' },
                        description: { type: 'string', description: 'The organizations bio' },
                        owner: { type: 'string', description: 'The discord snowflake/ID of the organization owner' }
                    }
                }
            }
        },
        response: {
            200: {
                status: { type: 'string' },
                message: { type: 'string' },
                data: { type: 'object' }
            },
            409: {
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