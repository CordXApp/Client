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

                let user = await req.client.db.entity.fetch({ entity: 'User', entityId: authorized.id });

                let avatarUrl: string = authorized.avatar?.startsWith('a_') ? `https://cdn.discordapp.com/avatars/${authorized.id}/${authorized.avatar}.gif` : `https://cdn.discordapp.com/avatars/${authorized.id}/${authorized.avatar}.webp`;
                let bannerUrl: string = authorized.banner?.startsWith('a_') ? `https://cdn.discordapp.com/banners/${authorized.id}/${authorized.banner}.gif` : `https://cdn.discordapp.com/banners/${authorized.id}/${authorized.banner}.webp`;

                if (!user.success) user = await req.client.db.entity.create({
                    entity: 'User',
                    user: {
                        id: req.client.db.cornflake.generate(),
                        userid: authorized.id as string,
                        avatar: avatarUrl,
                        banner: bannerUrl,
                        username: authorized.username as string,
                        globalName: authorized.global_name as string,
                        folder: authorized.id as string,
                        cookie: randomBytes(16).toString('hex')
                    }
                })

                else user = await req.client.db.entity.update({
                    entity: 'User',
                    user: {
                        userid: authorized.id,
                        avatar: avatarUrl,
                        banner: bannerUrl,
                        username: authorized.username as string,
                        globalName: authorized.global_name as string
                    }
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

                return res.status(302).redirect(redirect);
            }
        }
    }
}