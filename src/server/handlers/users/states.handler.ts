import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";

export class UserStates {

    constructor() { }

    public get States() {
        return {
            Handler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                const { userId } = req.params;

                const user = await req.client.db.user.model.fetch(userId);
                const perms = await req.client.modules.perms.user.acknowledgments(userId);

                return res.status(200).send({
                    banned: user.data.banned,
                    verified: user.data.verified,
                    perms: perms ? perms : 'No internal permissions'
                })
            },
            PreHandler: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                const { userId } = req.params;

                if (!userId) return res.status(500).send({
                    status: 'NO_USER_ID',
                    message: 'No user id provided',
                    code: 500
                });


                const test_user = await req.client.db.user.model.fetch(userId);

                if (!test_user.success) return res.status(500).send({
                    status: 'USER_NOT_FOUND',
                    message: test_user.message,
                    code: 500
                });
            }
        }
    }
}