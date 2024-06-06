import { Schema } from "../../../types/server/base.types";

export class UptimeRobot {
    public static Swagger: Schema = {
        tags: ['Status'],
        summary: 'View our system status',
        description: 'This endpoint is what gives us our information for our `/status` page.',
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        friendly_name: { type: 'string' },
                        type: { type: 'string' },
                        sub_type: { type: 'string' },
                        keyword_type: { type: 'string' },
                        keyword_case_type: { type: 'string' },
                        keyword_value: { type: 'string' },
                        port: { type: 'string' },
                        interval: { type: 'number' },
                        timeout: { type: 'number' },
                        status: { type: 'number' },
                        create_datetime: { type: 'number' },
                        custom_uptime_ratio: { type: 'string' },
                        custom_downtime_durations: { type: 'string' },
                        response_times: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    datetime: { type: 'number' },
                                    value: { type: 'string' }
                                }
                            }
                        },
                        average_response_time: { type: 'string' },
                    }
                }
            },
            500: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    error: { type: 'string' },
                    code: { type: 'number' }
                }
            }
        }
    }
}