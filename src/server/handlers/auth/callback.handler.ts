import { FastifyRequest, FastifyReply } from "fastify";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import OAuth2Client from "discord-oauth2";

export class CallbackHandler {
    constructor() { }

    public get Callback() {
        return {
            Handler: async (req: FastifyRequest<{ Querystring: { code: any, state: any } }>, res: FastifyReply) => {
                const { code, state } = req.query;
                const env: string = req.client.user!.id === '829979197912645652' ? 'development' : 'production';
                const auth = new OAuth2Client();

                if (!code || !state) return res.status(400).send({
                    status: 'MISSING_PARAMETERS',
                    message: 'Missing required parameters!',
                    code: 400
                });

                let { redirect } = JSON.parse(decodeURIComponent(state as string));

                const token = await auth.tokenRequest({
                    clientId: req.client.user!.id as string,
                    clientSecret: env === 'development' ? process.env.DEV_SECRET : process.env.PROD_SECRET,
                    grantType: 'authorization_code',
                    redirectUri: env === 'development' ? process.env.DEV_REDIRECT : process.env.PROD_REDIRECT,
                    scope: 'identify guilds',
                    code: code
                });

                const authorized = await auth.getUser(token.access_token);

                if (!authorized) return res.redirect(`/auth/login?redirect=${redirect}`);

                const auth_code = createHash('sha256').update(`${randomUUID()}_${randomUUID()}`.replace(/-/g, "")).digest('hex');

                let user = await req.client.db.user.model.fetch(authorized.id);

                // @ts-ignore
                if (!user.success) user = await req.client.db.user.model.create({
                    avatar: `https://cdn.discordapp.com/avatars/${authorized.id}/${authorized.avatar}.png`,
                    banner: `https://cdn.discordapp.com/banners/${authorized.id}/${authorized.banner}.png`,
                    username: authorized.username as string,
                    globalName: authorized.global_name as string,
                    userid: authorized.id as string,
                    secret: randomBytes(32).toString('hex'),
                    folder: authorized.id as string,
                    webhook: 'none',
                    domain: 'none',
                    cookie: randomBytes(24).toString('hex'),
                    banned: false,
                    verified: false,
                    key: randomBytes(64).toString('hex')
                })

                if (!user.success) return res.status(500).send({
                    status: 'INTERNAL_SERVER_ERROR',
                    message: user.message
                });

                if (user.data.banned) return res.status(403).send({
                    status: 'FORBIDDEN',
                    message: 'You are banned from using this service!',
                    code: 403
                });

                return res.status(302).redirect(`https://${redirect}/api/auth/validate?auth_code=${auth_code}`);
            }
        }
    }
}