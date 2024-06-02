import { FastifyRequest, FastifyReply } from "fastify";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import OAuth2Client from "discord-oauth2";

export class LoginHandler {
    constructor() { }

    public get Login() {
        return {
            Handler: async (req: FastifyRequest<{ Querystring: { redirect: string } }>, res: FastifyReply) => {
                let { redirect } = req.query;
                const env: string = req.client.user!.id === '829979197912645652' ? 'development' : 'production';
                const auth = new OAuth2Client();

                if (redirect && redirect.includes('https://')) return res.status(400).send({
                    status: 'INVALID_REDIRECT',
                    message: 'You do not need to provide the protocol in the redirect URL!',
                    code: 400
                });

                if (!redirect) redirect = 'cordximg.host'

                const state = JSON.stringify({
                    csrf_token: createHash('sha256').update(`${randomUUID()}_${randomUUID()}`.replace(/-/g, "")).digest('hex'),
                    date: new Date().toUTCString(),
                    user_agent: req.headers['user-agent'],
                    redirect: redirect,
                    ip: req.ip
                });

                const url = auth.generateAuthUrl({
                    clientId: req.client.user!.id as string,
                    redirectUri: env === 'development' ? process.env.DEV_REDIRECT : process.env.PROD_REDIRECT,
                    scope: ['identify', 'guilds'],
                    state: encodeURIComponent(state)
                });

                return res.redirect(url);
            }
        }
    }
}