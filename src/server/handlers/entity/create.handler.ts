import { FastifyRequest, FastifyReply } from "fastify";
import { CreateEntityQuery, CreateEntityBody } from "../../../types/server/entity.types";
import { User, Org } from "../../../types/database/entities";
import { Entities } from "../../../types/database/secrets";

export class EntityCreator {
    constructor() { }

    public get CreateEntity() {
        return {
            Handler: async (req: FastifyRequest<{ Querystring: CreateEntityQuery, Body: CreateEntityBody }>, res: FastifyReply) => {

                const { entity } = req.query;
                const { user, org } = req.body;
                let type: Entities;

                if (entity === 'user') type = 'User';
                else if (entity === 'org') type = 'Organization'

                else return res.status(422).send({
                    status: 'INVALID_ENTITY',
                    message: 'Entity type should be one of: org, user',
                    code: 422
                });

                const cornflake = req.db.cornflake.generate();

                if (entity === 'org') {

                    const testId = await req.db.entity.exists({ entity: type, entityId: cornflake });
                    const testName = await req.db.prisma.orgs.findFirst({ where: { name: org.name } });

                    if (testId) return res.status(409).send({
                        status: 'CONFLICT',
                        message: 'An organization already exists with this ID, please try again!',
                        code: 409
                    });

                    if (testName) return res.status(409).send({
                        status: 'CONFLICT',
                        message: 'An organization already exists with this name, please try again!',
                        code: 409
                    })
                } else if (entity === 'user') {

                    const testSnowflake = await req.db.entity.exists({ entity: type, entityId: user.userid });
                    const testCornflake = await req.db.prisma.users.findUnique({ where: { userid: user.userid } });

                    if (testSnowflake) return res.status(409).send({
                        status: 'CONFLICT',
                        message: 'A user already exists with the provided Discord Snowflake',
                        code: 409
                    });

                    if (testCornflake) return res.status(409).send({
                        status: 'CONFLICT',
                        message: 'A user already exists with the provided CordX Cornflake, please try again',
                        code: 409
                    });
                }

                const create = await req.db.entity.create({
                    entity: type,
                    user: entity === 'user' ? user : undefined,
                    org: entity === 'org' ? org : undefined
                });

                if (!create.success) return res.status(500).send({
                    status: 'ENTITY_CREATION_FAILED',
                    message: create.message as string,
                    code: 500
                });

                return res.status(200).send({
                    status: 'OK',
                    message: 'Entity created successfully!',
                    data: create.data
                })
            },

            PreHandler: async (req: FastifyRequest<{ Querystring: CreateEntityQuery, Body: CreateEntityBody }>, res: FastifyReply) => {

                const { entity } = req.query;
                const { user, org } = req.body;

                if (!entity) {
                    return res.status(422).send({
                        status: 'INVALID_QUERY',
                        message: 'The entity query should be one of user, org',
                        code: 422
                    });
                }

                if (entity === 'user' && (!user || !isUser(user))) {
                    return res.status(422).send({
                        status: 'INVALID_USER',
                        message: 'Please provide a valid user object',
                        code: 422
                    })
                }

                if (entity === 'org' && (!org || !isOrg(org))) {
                    return res.status(422).send({
                        status: 'INVALID_ORG',
                        message: 'Please provide a valid org object',
                        code: 422
                    })
                }
            }
        }
    }
}

function isUser(object: any): object is User {
    const keys: (keyof User)[] = ['userid', 'avatar', 'banner', 'username', 'globalName'];
    return typeof object === 'object' && keys.every(key => key in object);
}

function isOrg(object: any): object is Org {
    const keys: (keyof Org)[] = ['name', 'logo', 'banner', 'description', 'owner'];
    return typeof object === 'object' && keys.every(key => key in object);
}