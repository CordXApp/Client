import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createHash, randomUUID } from "node:crypto";
import auth from "discord-oauth2";

export default async function (fastify: FastifyInstance) {

    const oauth = new auth();

    fastify.route({
        method: 'GET',
        url: '/login',
        handler: async (req: FastifyRequest<{ Querystring: { redirect: string } }>, res: FastifyReply) => {
            const { redirect } = req.query;
            const env: string = req.client.user!.id === '829979197912645652' ? 'development' : 'production';

            if (!redirect) return res.status(400).send({
                message: 'No redirect provided',
                code: 400
            });

            const state = JSON.stringify({
                csrf_token: createHash('sha256').update(`${randomUUID()}_${randomUUID()}`.replace(/-/g, "")).digest('hex'),
                date: new Date().toUTCString(),
                user_agent: req.headers['user-agent'],
                redirect: redirect,
                ip: req.ip
            })

            const url = oauth.generateAuthUrl({
                clientId: req.client.user!.id as string,
                redirectUri: env === 'development' ? process.env.DEV_REDIRECT : process.env.PROD_REDIRECT,
                scope: ['identify', 'guilds'],
                state: encodeURIComponent(state)
            })

            return res.redirect(url);
        }
    })
}