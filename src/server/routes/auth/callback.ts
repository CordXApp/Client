import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createHash, randomUUID, randomBytes } from "node:crypto";
import auth from "discord-oauth2";

export default async function (fastify: FastifyInstance) {

    const oauth = new auth();

    fastify.route({
        method: 'GET',
        url: '/callback',
        handler: async (req: FastifyRequest<{ Querystring: { code: any, state: any } }>, res: FastifyReply) => {

            const { code, state } = req.query;
            const env: string = req.client.user!.id === '829979197912645652' ? 'development' : 'production';

            if (!code || !state) return res.status(400).send({
                message: 'No code or state provided',
                code: 400
            })

            const { redirect } = JSON.parse(decodeURIComponent(state as string));

            const token = await oauth.tokenRequest({
                clientId: req.client.user!.id as string,
                clientSecret: env === 'development' ? process.env.DEV_SECRET : process.env.PROD_SECRET,
                code: code,
                scope: 'identify guilds',
                grantType: 'authorization_code',
                redirectUri: env === 'development' ? process.env.DEV_REDIRECT : process.env.PROD_REDIRECT
            });

            const authorized = await oauth.getUser(token.access_token);

            if (!authorized) return res.redirect(`/auth/login?redirect=${redirect}`);

            const auth_code = createHash('sha256').update(`${randomUUID()}_${randomUUID()}`.replace(/-/g, "")).digest('hex');

            const user = await req.client.db.user.model.fetch(authorized.id);

            //@ts-ignore
            if (!user.success) user = await req.client.db.user.model.create({
                avatar: authorized.avatar as string,
                banner: authorized.banner as string,
                username: authorized.username as string,
                globalName: authorized.global_name as string,
                userid: authorized.id as string,
                secret: randomBytes(16).toString('hex') as string,
                folder: authorized.id as string,
                webhook: 'none',
                domain: 'none',
                cookie: randomBytes(24).toString('hex') as string,
                banned: false,
                verified: false,
                key: randomBytes(64).toString('hex')
            });

            if (!user.success) return res.status(500).send({
                message: user.message,
                code: 500
            })

            if (user.data.banned) return res.status(403).send({
                message: 'Whoops, looks like you\'ve been banned! Please contact support for more information',
                code: 403
            })

            return res.redirect(`${redirect}?auth_code=${auth_code}`);
        }
    })
}