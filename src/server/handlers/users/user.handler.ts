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
            }
        }
    }
}