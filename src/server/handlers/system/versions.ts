import { FastifyRequest, FastifyReply } from "fastify";

export class VersionHandler {
    constructor() { }

    public get versions() {
        return {
            handler: async (req: FastifyRequest<{ Querystring: { branch: string } }>, res: FastifyReply) => {
                res.header('Content-Type', 'application/json');
                const { branch } = req.query;

                if (branch === 'current') return res.status(200).send({
                    api: await req.client.utils.github.version('CordXApp/API', 'prod', 'package.json'),
                    bot: await req.client.utils.github.version('CordXApp/Client', 'master', 'package.json'),
                    docs: await req.client.utils.github.version('CordXApp/Documentation', 'master', 'package.json'),
                    dns: await req.client.utils.github.version('CordXApp/DNS', 'master', 'package.json'),
                    proxy: await req.client.utils.github.version('CordXApp/Proxy', 'master', 'package.json'),
                    web: await req.client.utils.github.version('CordXApp/Website', 'master', 'package.json'),
                })

                if (branch === 'newest') return res.status(200).send({
                    api: await req.client.utils.github.version('CordXApp/Client', 'development', 'package.json'),
                    bot: await req.client.utils.github.version('CordXApp/Client', 'development', 'package.json'),
                    docs: await req.client.utils.github.version('CordXApp/Documentation', 'master', 'package.json'),
                    dns: await req.client.utils.github.version('CordXApp/DNS', 'master', 'package.json'),
                    proxy: await req.client.utils.github.version('CordXApp/Proxy', 'master', 'package.json'),
                    web: await req.client.utils.github.version('CordXApp/Website', 'master', 'package.json'),
                })

                return res.status(200).send({
                    api: await req.client.utils.github.version('CordXApp/API', 'prod', 'package.json'),
                    bot: await req.client.utils.github.version('CordXApp/Client', 'master', 'package.json'),
                    docs: await req.client.utils.github.version('CordXApp/Documentation', 'master', 'package.json'),
                    dns: await req.client.utils.github.version('CordXApp/DNS', 'master', 'package.json'),
                    proxy: await req.client.utils.github.version('CordXApp/Proxy', 'master', 'package.json'),
                    web: await req.client.utils.github.version('CordXApp/Website', 'master', 'package.json'),
                })
            },
            preHandler: async (req: FastifyRequest<{ Querystring: { branch: string } }>, res: FastifyReply) => {
                const { branch } = req.query;

                if (!branch) return res.status(400).send({
                    message: 'Please provide a querystring of "branch=current", "branch=newest" or "branch=stable"',
                    code: 400
                });
            }
        }
    }
}