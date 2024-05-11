import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Unban extends SlashBase {
    constructor() {
        super({
            name: "unban",
            description: "Unban a user from the server",
            category: "Moderators",
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [
                {
                    name: 'userid',
                    description: 'The id of the user to unban',
                    required: true,
                    type: SubCommandOptions.String
                },
                {
                    name: 'reason',
                    description: 'The reason for unbanning the user',
                    required: true,
                    type: SubCommandOptions.String
                }
            ]
        })
    }

    public async execute(client: CordX, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {
        let member = await interaction.options.getString('userid');
        let reason = await interaction.options.getString('reason');
        const logs: any = await interaction?.guild?.channels.cache.find((c) => c.id === '871275213013262397')

        if (member === interaction?.member?.user.id) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: "Error: Invalid User",
                    description: "If you are seriously trying to unban yourself you obviously don't know how bans work.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        if (member === client?.user?.id) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: "Error: Invalid User",
                    description: "Are you seriously trying to unban me?.....",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        await interaction?.guild?.bans.remove(member as string, reason as string)
            .then(async (banned) => {
                await logs.send({
                    embeds: [
                        new client.EmbedBuilder({
                            title: '🔨 User unbanned!',
                            description: 'Wow, someone got another chance, lets hope they don\'t mess it up.',
                            thumbnail: banned?.displayAvatarURL(),
                            color: client.config.EmbedColors.success,
                            fields: [
                                {
                                    name: 'User',
                                    value: `${banned?.globalName ? banned?.globalName : banned?.username}`,
                                    inline: true
                                },
                                {
                                    name: 'User ID',
                                    value: `${banned?.id}`,
                                    inline: true
                                },
                                {
                                    name: 'Moderator',
                                    value: `${interaction?.user?.globalName ? interaction?.user?.globalName : interaction?.user?.username}`,
                                    inline: true
                                },
                                {
                                    name: 'Reason',
                                    value: `${reason}`,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: '🔨 User unbanned!',
                            color: client.config.EmbedColors.base,
                            description: `Wow someone got lucky with a second chance. If you are a moderator/admin you can view more details in: <#${logs?.id}>`,
                        })
                    ]
                })
            })
            .catch(async (e: Error) => {
                await client.logs.error(`Failed to unban user: ${e.stack}`);

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: Failed to unban user',
                            color: client.config.EmbedColors.error,
                            description: `${e.message}`
                        })
                    ]
                })
            })
    }
}