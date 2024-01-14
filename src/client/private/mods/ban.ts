import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../../client/CordX"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "ban",
            description: "Ban a user from the CordX Server.",
            category: "Moderators",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
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
                    required: false,
                    type: SubCommandOptions.String
                }
            ]
        })
    }

    public async execute(client: CordX, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const member = await interaction.options.getUser('user');
        let reason = await interaction.options.getString('reason');
        const perms = await client.perms.checkPermissions(interaction?.guild?.id as string, interaction?.member?.user.id as string, ['BAN_MEMBERS']);
        const logs: any = await interaction?.guild?.channels.cache.find((c) => c.id === '871275213013262397')

        if (member?.id === interaction?.member?.user.id) return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: "Error: Invalid User",
                    description: "You cannot ban yourself.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        if (member?.id === client.user?.id) return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: "Error: Invalid User",
                    description: "You cannot ban me.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        if (!perms) return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: "Error: Missing Permissions",
                    description: "You don't have the required permissions to run this command.",
                    color: client.config.EmbedColors.error,
                    fields: [
                        {
                            name: "Required Permissions",
                            value: `\`BAN_MEMBERS\``,
                            inline: true
                        }
                    ]
                })
            ]
        })

        if (!reason) reason = "No reason provided";

        let modname = interaction?.member?.user?.username as string;
        let user = await interaction?.guild?.members?.cache.get(member?.id as string);
        
        if (!user?.manageable) return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: "Error: Missing Permissions",
                    description: "I don't have the required permissions to ban this user.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        if (!user?.moderatable) return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: "Error: Missing Permissions",
                    description: "Whoops, i was unable to ban that user! this could be perm related or they could be a higher role than me.",
                    color: client.config.EmbedColors.error,
                })
            ]
        })

        await interaction?.guild?.bans?.create(member?.id as string, { reason: reason as string  })
        .then(async (banned) => {

            await logs?.send({
                embeds: [
                    new client.Embeds({
                        title: "User Banned",
                        description: `${member?.username} has been banned!`,
                        color: client.config.EmbedColors.success,
                        fields: [
                            {
                                name: "Reason",
                                value: reason,
                                inline: true
                            },
                            {
                                name: 'Moderator',
                                value: modname,
                                inline: true
                            }
                        ]
                    })
                ]
            })

            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: "User Banned",
                        description: `${member?.username} has been banned by ${modname}!`,
                        color: client.config.EmbedColors.success,
                        fields: [
                            {
                                name: "Reason",
                                value: reason,
                                inline: true
                            }
                        ]
                    })
                ]
            })
        })
        .catch((error: Error) => {

            client.logs.error(`[BAN]: failed to ban user: ${error.stack}`)

            return interaction.reply({
                embeds: [
                    new client.Embeds({
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
