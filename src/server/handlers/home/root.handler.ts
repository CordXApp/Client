import { FastifyRequest, FastifyReply } from "fastify";

export class RootHandler {
    constructor() { }

    public get Home() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {
                return res.status(200).send({
                    message: 'Hey there, welcome to the CordX API!',
                    swagger: '/docs',
                    documentation: 'https://help.cordx.lol',
                    status: 'https://status.cordx.lol',
                    code: 200
                })
            }
        }
    }
}