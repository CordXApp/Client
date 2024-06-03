import { FastifyRequest, FastifyReply } from "fastify";

export class Advice {
    constructor() { }

    public static async Handler(req: FastifyRequest, reply: FastifyReply) {
        reply.header('Content-Type', 'application/json');

        const response = await req.client.funmod.generate.Advice();

        return reply.code(200).send({ response });
    }
}