import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class UserDomainsHandler {

    constructor() { }

    public get UserDomains() {
        return {
            Handler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const user = await req.client.db.user.model.profile(req.params.userId);

                if (!user.success) return res.status(404).send({
                    message: `${user.message}`,
                    code: 404
                })

                const domains = user.data.domains.map((domain: any) => ({
                    name: domain.name,
                    created: domain.createdAt,
                    verified: domain.verified
                }))

                return res.status(200).send(JSON.stringify({
                    domains: domains
                }))
            },
            PreHandler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.params;

                if (!userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                })

                const test = await req.client.db.user.model.profile(userId);

                if (!test.success) return res.status(404).send({
                    message: test.message,
                    code: 404
                })
            }
        }
    }
}