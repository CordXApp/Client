import { FastifyRequest, FastifyReply } from "fastify";
import { FetchEntity } from "../../../types/server/entity.types";
import { Entities } from "../../../types/database/entities";

export class EntityViewer {
    constructor() { }

    public get ViewEntity() {
        return {
            Handler: async (req: FastifyRequest<{ Querystring: FetchEntity }>, res: FastifyReply) => {
                const { type, id } = req.query;

                let data: any = {};
                let entity: string;

                if (type === 'user') entity = 'User';
                else if (type === 'org') entity = 'Organization';

                else return res.status(422).send({
                    status: 'INVALID_ENTITY',
                    message: 'Entity should be one of: user, org',
                    code: 422
                });

                const test = await req.db.entity.exists({ entity: entity as Entities, entityId: id });

                if (!test) return res.status(404).send({
                    status: 'ENTITY_NOT_FOUND',
                    message: `Unable to locate a ${entity} entity with the provided entityId`,
                    code: 404
                });

                const fetch = await req.db.entity.fetch({ entity: entity as Entities, entityId: id });

                if (!fetch.success) return res.status(500).send({
                    status: 'FAILED_TO_FETCH',
                    message: fetch.message,
                    code: 500
                });

                if (type === 'user') data = {
                    username: fetch.data.username,
                    globalName: fetch.data.globalName,
                    avatar: fetch.data.avatar,
                    banner: fetch.data.banner,
                    domain: fetch.data.domain,
                    cornflake: fetch.data.id,
                    snowflake: fetch.data.userid,
                    banned: fetch.data.banned,
                    verified: fetch.data.verified,
                    beta: fetch.data.beta
                };

                if (type === 'org') data = {
                    name: fetch.data.name,
                    logo: fetch.data.logo,
                    banner: fetch.data.banner,
                    about: fetch.data.description,
                    owner: fetch.data.owner,
                    banned: fetch.data.banned,
                    verified: fetch.data.verified,
                    partner: fetch.data.partner,
                    domain: fetch.data.domain,
                    domains: fetch.data.domains.length > 0 ? fetch.data.domains : 'No domains available.',
                    links: fetch.data.links ? fetch.data.links : 'No social links available',
                    members: fetch.data.members.length > 0 ? fetch.data.members : 'No members available',
                    created: fetch.data.createdAt,
                    updated: fetch.data.updatedAt,
                };

                return res.status(200).send(data);
            },

            PreHandler: async (req: FastifyRequest<{ Querystring: FetchEntity }>, res: FastifyReply) => {

                const { type, id } = req.query;

                if (!type) return res.status(422).send({
                    status: 'INVALID_QUERY',
                    message: 'Please provide the type of entity (user, org)',
                    code: 422
                });

                if (!id) return res.status(422).send({
                    status: 'INVALID_QUERY',
                    message: 'Please provide the ID of the entity you want to view!',
                    code: 422
                });
            }
        }
    }
}