import { Schema } from "../../../types/server/base.types";

export class AdviceSchema {
    public static Swagger: Schema = {
        tags: ['Client'],
        summary: 'Random Advice',
        description: 'Generate a random piece of advice!',
        response: {
            200: {
                response: { type: 'string' }
            }
        }
    }
}