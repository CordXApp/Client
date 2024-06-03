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

                else user = await req.client.db.user.model.update(authorized.id as string, {
                    id: user.data.id,
                    userid: user.data.userid as string,
                    avatar: user.data.avatar !== 'https://cdn.discordapp.com/avatars/${authorized.id}/${authorized.avatar}.png' ? `https://cdn.discordapp.com/avatars/${authorized.id}/${authorized.avatar}.png` : user.data.avatar,
                    banner: user.data.banner !== 'https://cdn.discordapp.com/banners/${authorized.id}/${authorized.banner}.png' ? `https://cdn.discordapp.com/banners/${authorized.id}/${authorized.banner}.png` : user.data.banner,
                    username: user.data.username !== authorized.username ? authorized.username as string : user.data.username,
                    globalName: user.data.globalName !== authorized.global_name ? authorized.global_name as string : user.data.globalName,
                    secret: user.data.secret !== randomBytes(32).toString('hex') ? randomBytes(32).toString('hex') : user.data.secret,
                    folder: user.data.folder,
                    webhook: user.data.webhook,
                    domain: user.data.domain,
                    cookie: user.data.cookie !== randomBytes(24).toString('hex') ? randomBytes(24).toString('hex') : user.data.cookie,
                    banned: user.data.banned,
                    verified: user.data.verified,
                    key: user.data.Key,
                    beta: user.data.beta
                })

                if (!user.success) return res.status(500).send({
                    status: 'INTERNAL_SERVER_ERROR',
                    message: user.message,
                    code: 500
                });

                if (user.data.banned) return res.status(403).send({
                    status: 'FORBIDDEN',
                    message: 'You are banned from using this service!',
                    code: 403
                });

                if (!user.data.beta) return res.status(403).send({
                    status: 'FORBIDDEN',
                    message: 'You are not a beta tester!',
                    code: 403
                });

                const encodedAuthCode = encodeURIComponent(auth_code);
                const encodedUser = encodeURIComponent(JSON.stringify(user.data));

                if (redirect.includes('localhost')) redirect = `http://${redirect}/api/auth/validate?user_data=${encodedUser}&auth_code=${encodedAuthCode}`;
                else redirect = `https://${redirect}/api/auth/validate?user_data=${encodedUser}&auth_code=${encodedAuthCode}`

                return res.status(302).redirect(`http://localhost:3000/api/auth/validate?user_data=${encodedUser}&auth_code=${encodedAuthCode}`);
            }
        }
    }
}