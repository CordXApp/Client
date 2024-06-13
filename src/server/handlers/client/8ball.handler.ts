import { FastifyRequest, FastifyReply } from "fastify";

export class EightBall {
    constructor() { }

    public static async Handler(req: FastifyRequest, reply: FastifyReply) {
        reply.header('Content-Type', 'application/json');

        const response = await req.client.db.modules.funmod.generate.EightBall();

        return reply.code(200).send({ response });
    }
}