import { FastifyRequest, FastifyReply } from "fastify";
import { NewEntitySecret } from "../../../../types/server/param.types";

export class AdminSecrets {
    constructor() { }

    public get CreateSecret() {
        return {
            Handler: async (req: FastifyRequest<{ Body: NewEntitySecret }>, res: FastifyReply) => {
                const { key } = req.headers;
                const { entity, userId, orgId } = req.body;

                switch (entity) {

                    case 'Admin': {

                        const secret = await req.client.db.secret.model.create({
                            entity: 'Admin',
                            entityId: '',
                            maxUses: 5000
                        });

                        if (!secret.success) return res.status(500).send({
                            status: 'INTERNAL_SERVER_ERROR',
                            message: secret.message,
                            code: 500
                        });

                        return res.status(201).send({
                            status: 'CREATED',
                            message: 'Admin Secret created successfully',
                            data: secret.data
                        });
                    }
                }
            },

            PreHandler: async (req: FastifyRequest<{ Body: NewEntitySecret }>, res: FastifyReply) => {
                const { key } = req.headers
                const { entity, userId, orgId } = req.body;

                if (!req.body) return res.status(400).send({
                    status: 'INVALID_BODY',
                    message: 'Please provide a valid body',
                    code: 400
                });

                if (orgId && entity !== 'Organization') return res.status(400).send({
                    status: 'INVALID_BODY',
                    message: 'The \`orgId\` param should only be provided when using the Organization entity',
                    code: 400
                });

                if (userId && entity !== 'User') return res.status(400).send({
                    status: 'INVALID_BODY',
                    message: 'The \`userId\` param should only be provided when using the User entity',
                    code: 400
                });

                switch (entity) {

                    case 'Admin': {

                        const validate = await req.client.db.prisma.secrets.findFirst({
                            where: {
                                key: req.client.db.secret.model.decrypt(key as string),
                                entity: 'Admin'
                            }
                        });

                        if (!validate) return res.status(403).send({
                            status: 'UNAUTHORIZED',
                            message: 'Please provide a valid Admin API Key',
                            code: 403
                        });
                    }

                        break;

                    case 'Organization': {

                        if (!orgId) return res.status(400).send({
                            status: 'INVALID_BODY',
                            message: 'Please provide a valid \`orgId\`',
                            code: 400
                        });

                        const validate = await req.client.db.prisma.secrets.findFirst({
                            where: {
                                key: req.client.db.secret.model.decrypt(key as string),
                                entity: 'Admin'
                            }
                        });

                        if (!validate) return res.status(403).send({
                            status: 'UNAUTHORIZED',
                            message: 'Please provide a valid "ADMIN" API Key',
                            code: 403
                        });

                    }

                        break;

                    default: {

                        if (!userId) return res.status(400).send({
                            status: 'INVALID_BODY',
                            message: 'Please provide a valid \`userId\`',
                            code: 400
                        });

                        const validate = await req.client.db.prisma.secrets.findFirst({
                            where: {
                                key: req.client.db.secret.model.decrypt(key as string),
                                entity: 'Admin'
                            }
                        });

                        if (!validate) return res.status(403).send({
                            status: 'UNAUTHORIZED',
                            message: 'Please provide a valid "ADMIN" API Key',
                            code: 403
                        });
                    }
                }
            }
        }
    }
}