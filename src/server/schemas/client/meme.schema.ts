import { Schema } from "../../../types/server/base.types";

export class MemeSchema {
    public static Random: Schema = {
        tags: ['Client'],
        summary: 'Random meme',
        description: 'Generate a random meme.',
        response: {
            200: {
                type: 'object',
                properties: {
                    image: { type: 'string' },
                    category: { type: 'string' },
                    caption: { type: 'string' }
                }
            }
        }
    }

    public static Reddit: Schema = {
        tags: ['Client'],
        summary: 'Random Reddit Meme',
        description: 'Generate a random meme from reddit.',
        response: {
            200: {
                type: 'object',
                properties: {
                    image: { type: 'string' },
                    category: { type: 'string' },
                    caption: { type: 'string' },
                    permalink: { type: 'string' }
                }
            }
        }
    }
}