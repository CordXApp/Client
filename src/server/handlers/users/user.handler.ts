import { FastifyReply, FastifyRequest } from "fastify";
import { GetDiscordUser } from "../../../types/server/param.types";
import { DiscordUser } from "../../../types/server/user.types";

export class UserHandler {

    constructor() { }

    public get handler() {
        return {
            getDiscordUser: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.params;

                const discord = await fetch(`https://discord.com/api/v10/users/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bot ${req.client.token}`
                    }
                })

                const user = await discord.json() as DiscordUser;

                let banner: any = user?.banner ? user?.banner : null;
                let avatar: any = user?.avatar ? user?.avatar : null;

                const avatarFormat = avatar?.startsWith('a_') ? 'gif' : 'png';
                const bannerFormat = banner?.startsWith('a_') ? 'gif' : 'png';

                return res.status(200).send({
                    id: user.id,
                    username: user.username,
                    globalName: user.global_name,
                    avatar: {
                        id: avatar,
                        url: `https://cdn.discordapp.com/avatars/${user.id}/${avatar}.${avatarFormat}`,
                        gif: avatar?.startsWith('a_') ? true : false
                    },
                    banner: {
                        id: banner,
                        url: `https://cdn.discordapp.com/banners/${user.id}/${banner}.${bannerFormat}`,
                        color: user.banner_color,
                        gif: banner?.startsWith('a_') ? true : false
                    },
                    created: user.created_at
                })
            },
            getUserUploads: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                const uploads = await req.client.spaces.user.list(req.params.userId);

                return res.status(200).send({
                    uploads: uploads.data.splice(Math.floor(Math.random() * uploads.data.length), 9)
                })
            },
            getUserUploadStats: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const stats = await req.client.spaces.stats.profile(req.params.userId);

                return res.status(200).send(JSON.stringify(stats.data))
            },
            getUserProfile: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const user = await req.client.db.user.profile(req.params.userId);

                if (!user.success) return res.status(404).send({
                    message: `${user.message}`,
                    code: 404
                })

                return res.status(200).send(JSON.stringify({
                    id: user.data.userid,
                    avatar: user.data.avatar,
                    banner: user.data.banner,
                    username: user.data.username,
                    globalName: user.data.globalName,
                    secret: user.data.secret,
                    cookie: user.data.cookie,
                    banned: user.data.banned,
                    verified: user.data.verified,
                    domain: user.data.domain

                }))
            },
            getUserDomains: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const user = await req.client.db.user.profile(req.params.userId);

                if (!user.success) return res.status(404).send({
                    message: `${user.message}`,
                    code: 404
                })

                const domains = user.data.domains.map((domain: any) => ({
                    name: domain.name,
                    created: domain.createdAt,
                    verified: domain.verified
                }))

                return res.status(200).send(JSON.stringify({
                    domains: domains
                }))
            }
        }
    }

    public get preHandler() {
        return {
            getDiscordUser: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                const { userId } = req.params;

                const test = await fetch(`https://discord.com/api/v10/users/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bot ${req.client.token}`
                    }
                });

                if (test.status === 500) return res.status(500).send({
                    message: 'An error occurred while trying to fetch the user from discord',
                    error: test.statusText,
                    code: 500
                });

                if (test.status >= 429) return res.status(429).send({
                    message: 'Request limit reached, please try again later.',
                    error: test.statusText,
                    code: 429
                });

                if (test.status >= 427) return res.status(427).send({
                    message: 'Request limit reached, please try again later.',
                    error: test.statusText,
                    code: 427
                });

                if (!userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                });
            },
            getUserUploads: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                if (!req.params.userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                });

                const test = await req.client.spaces.user.list(req.params.userId);

                if (!test.success) return res.status(404).send({
                    message: test.message,
                    code: 404
                })
            },
            getUserUploadStats: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {

                if (!req.params.userId) return res.status(500).send({
                    message: 'No user id provided',
                    code: 500
                });

                const test = await req.client.spaces.stats.profile(req.params.userId);

                if (!test.success) return res.status(500).send({
                    message: test.message,
                    code: 500
                })

            },
            getUserProfile: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const { userId, secret } = req.params;

                if (!userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                });

                const test = await req.client.db.user.profile(userId);

                if (!test.success) return res.status(500).send({
                    message: test.message,
                    code: 500
                })

                const exists = await req.client.db.secret.exists(secret as string);

                if (!secret || !exists) return res.status(400).send({
                    message: 'Please provide a valid CordX API Secret',
                    code: 400
                })
            },
            getUserDomains: async (req: FastifyRequest<{ Params: GetDiscordUser }>, res: FastifyReply) => {
                const { userId } = req.params;

                if (!userId) return res.status(400).send({
                    message: 'No user id provided',
                    code: 400
                })

                const test = await req.client.db.user.profile(userId);

                if (!test.success) return res.status(404).send({
                    message: test.message,
                    code: 404
                })
            }
        }
    }
}