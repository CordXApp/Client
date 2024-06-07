import { FastifyRequest, FastifyReply } from "fastify";
const Memes = require("random-memes");

export class MemeHandler {
    constructor() { }

    public static async Random(req: FastifyRequest, reply: FastifyReply) {
        const meme = await Memes.random();

        return reply.code(200).send(meme);
    }

    public static async Reddit(req: FastifyRequest, reply: FastifyReply) {
        const meme = await Memes.reddit({ locale: 'en' });

        return reply.code(200).send(meme);
    }
}