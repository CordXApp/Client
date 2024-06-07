import { FastifyRequest, FastifyReply } from "fastify";

export class AdminSecrets {
    constructor() { }

    public get CreateSecret() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {

                const create = await req.client.db.secret.model.create();

                if (!create.success) return res.status(500).send({
                    status: 'ERROR',
                    message: create.message,
                    code: 500
                });


                req.client.logs.info(JSON.stringify(create.data))

                return res.status(201).send({
                    status: 'SUCCESS',
                    message: create.message,
                    admin_key: create.data,
                    code: 201
                });
            },
            PreHandler: async (req: FastifyRequest, res: FastifyReply) => {
                const { key } = req.headers

                if (!key) return res.status(400).send({
                    status: 'UNAUTHORIZED',
                    message: 'No admin key provided',
                    code: 401
                });

                const test = await req.client.db.secret.model.exists(key as string);

                if (!test) return res.status(401).send({
                    status: 'UNAUTHORIZED',
                    message: 'Invalid admin key provided',
                    code: 401
                });
            }
        }
    }
}