import { Schema } from "../../../types/server/base.types";

export class StatsSchema {
    public static Swagger: Schema = {
        tags: ['System'],
        summary: 'View our system statistics',
        description: 'View our system statistics, this includes domains, reports and more.',
        response: {
            200: {
                users: { type: 'number' },
                uploads: { type: 'number' },
                domains: { type: 'number' },
                partners: { type: 'number' },
                errors: { type: 'number' },
                orgs: { type: 'number' }
            },
        }
    }
}