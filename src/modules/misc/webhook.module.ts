import type CordX from "../../client/cordx"
import Logger from "../../utils/logger.util"
import { HookParams } from "../../types/modules/hooks";
import axios from "axios";

export class Webhooks {
    private client: CordX;
    public logs: Logger;

    constructor(client: CordX) {
        this.client = client;
        this.logs = new Logger("WEBHOOKS");
    }

    public get webhooks() {
        return {
            send: async ({ userid, webhook, link, type, info }: HookParams): Promise<void> => {

                if (!userid) return this.logs.error(`Failed to send webhook: no user id provided`);
                if (!webhook) return this.logs.error(`Failed to send webhook: no webhook provided`);
                if (!link) return this.logs.error(`Failed to send webhook: no link provided`);
                if (!type) return this.logs.error(`Failed to send webhook: no type provided`);
                if (!info) return this.logs.error(`Failed to send webhook: no info provided`);

                const user = await this.client.db.entity.fetch({ entityId: userid, entity: 'User' });
                const embed = await this.embeds.generate({ user, type, info, link });
                const files = type !== 'mp4' ? [] : [{ name: info.name as string, attachment: link as string }];

                if (!user.success) return this.logs.error(`Failed to fetch user data for webhook: ${user.message}`);

                if (webhook !== 'none') {

                    await axios.post(webhook, {
                        username: 'CordX Uploads',
                        avatar_url: 'https://cordximg.host/assets/logo.png',
                        files: files,
                        embeds: [embed]
                    }, {
                        headers: { Authorization: process.env.PROXY_TOKEN }
                    }).catch((err: Error) => {
                        this.logs.error(`Webhook error: ${err.message}`);
                        this.logs.debug(err.stack as string);
                    })
                }
            }
        }
    }

    public get embeds() {
        return {
            generate: async ({ user, type, info, link }: HookParams): Promise<any> => {
                let embed;

                switch (type) {
                    case 'mp4': embed = {
                        title: '🎥 Notification: video uploaded',
                        thumbnail: { url: `${this.client.config.Cordx.domain}/assets/logo.png` },
                        author: {
                            name: user.data.global_name ? user.data.global_name : user.data.username,
                            url: `${this.client.config.Cordx.domain}/users/${user.data.id}`,
                            icon_url: user.data.avatar
                        },
                        fields: [{
                            name: 'Name',
                            value: info.name as string,
                            inline: true
                        }, {
                            name: 'Size',
                            value: info.size as string,
                            inline: true
                        }, {
                            name: 'Created',
                            value: info.date,
                            inline: true
                        }],
                        footer: {
                            text: '© 2023 - CordX',
                            icon_url: `${this.client.config.Cordx.domain}/assets/logo.png`
                        }
                    };

                        break;

                    case 'png':
                    case 'jpeg': embed = {
                        title: '🖼️ Notification: image uploaded',
                        thumbnail: { url: `${this.client.config.Cordx.domain}/assets/logo.png` },
                        image: { url: link },
                        author: {
                            name: user.data.global_name ? user.data.global_name : user.data.username,
                            url: `${this.client.config.Cordx.domain}/users/${user.data.userid}`,
                            icon_url: user.data.avatar
                        },
                        fields: [{
                            name: 'Name',
                            value: info.name as string,
                            inline: true
                        }, {
                            name: 'Size',
                            value: info.size as string,
                            inline: true
                        }, {
                            name: 'Created',
                            value: info.date,
                            inline: true
                        }],
                        footer: {
                            text: '© 2023 - CordX',
                            icon_url: `${this.client.config.Cordx.domain}/assets/logo.png`
                        }
                    }

                        break;

                    case 'gif': embed = {
                        title: '🎞️ Notification: gif uploaded',
                        thumbnail: { url: `${this.client.config.Cordx.domain}/assets/logo.png` },
                        image: { url: link },
                        author: {
                            name: user.data.global_name ? user.data.global_name : user.data.username,
                            url: `${this.client.config.Cordx.domain}/users/${user.data.id}`,
                            icon_url: user.data.avatar
                        },
                        fields: [{
                            name: 'Name',
                            value: info.name as string,
                            inline: true
                        }, {
                            name: 'Size',
                            value: info.size as string,
                            inline: true
                        }, {
                            name: 'Created',
                            value: info.date,
                            inline: true
                        }],
                        footer: {
                            text: '© 2023 - CordX',
                            icon_url: `${this.client.config.Cordx.domain}/assets/logo.png`
                        }
                    }

                        break;

                    case 'default': embed = {
                        title: '📄 Notification: file uploaded',
                        thumbnail: { url: `${this.client.config.Cordx.domain}/assets/logo.png` },
                        author: {
                            name: user.data.global_name ? user.data.global_name : user.data.username,
                            url: `${this.client.config.Cordx.domain}/users/${user.data.id}`,
                            icon_url: user.data.avatar
                        },
                        fields: [{
                            name: 'Name',
                            value: info.name as string,
                            inline: true
                        }, {
                            name: 'Size',
                            value: info.size as string,
                            inline: true
                        }, {
                            name: 'Created',
                            value: info.date,
                            inline: true
                        }],
                        footer: {
                            text: '© 2023 - CordX',
                            icon_url: `${this.client.config.Cordx.domain}/assets/logo.png`
                        }
                    }
                }

                return embed;
            }
        }
    }
}