import { FastifyRequest, FastifyReply } from "fastify";

export class EightBall {
    constructor() { }

    public static Handler(req: FastifyRequest, reply: FastifyReply) {
        reply.header('Content-Type', 'application/json');

        const response = req.client.funmod.generate.EightBall();

        return reply.code(200).send({ response });
    }
}