import { FastifyRequest, FastifyReply } from "fastify";

export class SystemStats {
    constructor() { }

    public get Stats() {
        return {
            Handler: async (req: FastifyRequest, res: FastifyReply) => {

                const users = await req.client.db.prisma.users.count();
                const uploads = await req.client.db.prisma.images.count();
                const domains = await req.client.db.prisma.domains.count();
                const partners = await req.client.db.prisma.partners.count();
                const reports = await req.client.db.prisma.reports.count();
                const errors = await req.client.db.prisma.errors.count();
                const orgs = await req.client.db.prisma.orgs.count();

                return res.status(200).send(JSON.stringify({ users, uploads, domains, partners, reports, errors, orgs }));
            }
        }
    }
}