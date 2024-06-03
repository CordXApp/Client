import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Ban extends SlashBase {
    constructor() {
        super({
            name: "ban",
            description: "Ban a user from the CordX Server.",
            category: "Moderators",
            cooldown: 5,
            permissions: {
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands', 'BanMembers', 'ModerateMembers'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands', 'BanMembers', 'ModerateMembers']
            },
            options: [
                {
                    name: 'user',
                    description: 'The user to ban',
                    required: true,
                    type: SubCommandOptions.User
                },
                {
                    name: 'reason',
                    description: 'The reason for the ban',
                    required: true,
                    type: SubCommandOptions.String
                }
            ]
        })
    }

    public async execute(client: CordX, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const member = await interaction.options.getUser('user');
        let reason = await interaction.options.getString('reason');
        const logs: any = await interaction?.guild?.channels.cache.find((c) => c.id === '871275213013262397')

        if (member?.id === interaction?.member?.user.id) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: "Error: Invalid User",
                    description: "You cannot ban yourself.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        if (member?.id === client.user?.id) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: "Error: Invalid User",
                    description: "You cannot ban me.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        let modname = interaction?.member?.user?.username as string;
        let user = await interaction?.guild?.members?.cache.get(member?.id as string);

        if (!user?.manageable) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: "Error: Missing Permissions",
                    description: "I don't have the required permissions to ban this user.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        if (!user?.moderatable) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: "Error: Missing Permissions",
                    description: "Whoops, i was unable to ban that user! this could be perm related or they could be a higher role than me.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        await interaction?.guild?.bans?.create(member?.id as string, { reason: reason as string, deleteMessageSeconds: 86400 })
            .then(async (banned: any) => {

                await logs?.send({
                    embeds: [
                        new client.EmbedBuilder({
                            title: "🔨 User Banned",
                            description: 'Whoops, someone has been naughty! here are the details:',
                            thumbnail: banned.displayAvatarURL(),
                            color: client.config.EmbedColors.success,
                            fields: [
                                {
                                    name: 'User',
                                    value: `${banned?.globalName ? member?.globalName : member?.username}`,
                                    inline: true
                                },
                                {
                                    name: 'User ID',
                                    value: `${member?.id}`,
                                    inline: true
                                },
                                {
                                    name: 'Moderator',
                                    value: modname,
                                    inline: true
                                },
                                {
                                    name: 'Reason',
                                    value: reason,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: "🔨 User Banned",
                            description: `Damn, someone was naughty and got the ban hammer. If you are a moderator/admin you can view more details in: <#${logs?.id}>`,
                            color: client.config.EmbedColors.success,
                        })
                    ]
                })
            })
            .catch((error: Error) => {

                client.logs.error(`[BAN]: failed to ban user: ${error.stack}`)

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: "Error: Failed to ban user",
                            description: `Failed to ban ${member?.username}, please try again later.`,
                            color: client.config.EmbedColors.error,
                            fields: [
                                {
                                    name: "Error",
                                    value: `\`\`\`${error.stack}\`\`\``,
                                    inline: true
                                }
                            ]
                        })
                    ]
                })
            })
    }
}
