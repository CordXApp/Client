import { FastifyRequest, FastifyReply } from "fastify";

export class CordXTeam {
    constructor() { }

    public get Team() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {
                res.header('Content-Type', 'application/json');

                const staff = await req.client.db.user.model.staff();

                if (!staff.success) return res.status(500).send({
                    success: false,
                    message: `Unable to fetch staff members from the database.`,
                    error: staff.message,
                    code: 500
                })

                return res.status(200).send(JSON.stringify(staff.data));
            }
        }
    }
}