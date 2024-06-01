import { FastifyRequest, FastifyReply } from "fastify";

export class VersionHandler {
    constructor() { }

    public get Versions() {
        return {
            Handler: async (req: FastifyRequest<{ Querystring: { branch: string } }>, res: FastifyReply) => {
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
            PreHandler: async (req: FastifyRequest<{ Querystring: { branch: string } }>, res: FastifyReply) => {
                const { branch } = req.query;

                if (!branch) return res.status(400).send({
                    status: 'INVALID_BRANCH',
                    message: 'Please provide a branch of either current, newest or stable!',
                    code: 400
                });

                if (branch !== 'current' && branch !== 'newest' && branch !== 'stable') return res.status(400).send({
                    status: 'INVALID_BRANCH',
                    message: 'Please provide a branch of either current, newest or stable!',
                    code: 400
                });
            }
        }
    }
}