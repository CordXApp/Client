import { Schema } from "../../../types/server/base.types";

export class EightBallSchema {
    public static Swagger: Schema = {
        tags: ['Client'],
        summary: 'Eight Ball Response',
        description: 'Generate a random response from the magic 8 ball!',
        response: {
            200: {
                response: { type: 'string' }
            }
        }
    }
}