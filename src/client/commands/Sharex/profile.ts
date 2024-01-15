import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import { SubCommandOptions } from "../../../types/utilities"
import { UserStats } from "../../../types/user/stats"
import type CordX from "../../CordX"

export default class Profile extends SlashBase {
    constructor() {
        super({
            name: "profile",
            description: "View your profile information and settings.",
            usage: "/profile <subCommand>",
            example: "/profile stats",
            category: "Info",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'help',
                    description: 'View the help menu.',
                    example: '/profile help',
                    type: SubCommandOptions.SubCommand,
                    required: false,
                },
                {
                    name: 'stats',
                    description: 'View your profile/upload stats.',
                    example: '/profile stats',
                    type: SubCommandOptions.SubCommand,
                    required: false,
                }
            ]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'stats': {

                const stats = await client.api.request('GET', `users/${interaction?.user?.id}/stats`)

                if (stats.error) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Profile Stats',
                            description: 'There was an error while fetching your stats.',
                            color: client.config.EmbedColors.error,
                            fields: [
                                {
                                    name: 'Status',
                                    value: `\`${stats?.status}\``,
                                    inline: false
                                },
                                {
                                    name: 'Message',
                                    value: `\`${stats?.message}\``,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                const data: UserStats = stats?.data;

                if (!data) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Profile Stats',
                            description: 'There was an error while fetching your stats.',
                            color: client.config.EmbedColors.error,
                            fields: [
                                {
                                    name: 'Status',
                                    value: `\`${stats?.status}\``,
                                    inline: false
                                },
                                {
                                    name: 'Message',
                                    value: `\`${stats?.message}\``,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                const images = data?.files?.images ? data?.files?.images : 0;
                const downloads = data?.files?.downloads ? data?.files?.downloads : 0;
                const videos = data?.files?.mp4 ? data?.files?.mp4 : 0;
                const used = data?.storage?.used ? data?.storage?.used : 0;
                const remains = data?.storage?.remains ? data?.storage?.remains : 0;
                
                let png = data.files.png ? data.files.png : 0;
                let gif = data.files.gif ? data.files.gif : 0;
                let other = data.files.other ? data.files.other : 0;

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Success: profile found!',
                            description: 'Here is your profile/upload statistics.',
                            author: {
                                name: `${interaction?.user?.username}`,
                                iconURL: interaction?.user?.displayAvatarURL(),
                                url: `https://cordx.lol/users/${interaction?.user?.id}`
                            },
                            color: client.config.EmbedColors.base,
                            fields: [
                                {
                                    name: 'ℹ️ Storage Used',
                                    value: `${used} MB`,
                                    inline: true
                                },
                                {
                                    name: '🖼️ Total Images',
                                    value: `${images} total`,
                                    inline: true
                                },
                                {
                                    name: '⏬ Total Downloads',
                                    value: `${downloads} total`,
                                    inline: true
                                },
                                {
                                    name: 'Breakdown',
                                    value: `• 🖼️ PNG\'s: ${png}\n• 🎞️ GIF\'s: ${gif}\n• 📹 MP4: ${videos}\n• ❔ Other: ${other}`,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })
            } 

            case 'help': {

                const subcommands = await this?.props?.options?.map((option) => {
                    return `\`${option?.example}\` - ${option?.description}`
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Profile Help',
                            description: 'Below are the available subcommands and their usage.',
                            color: client.config.EmbedColors.error,
                            fields: [
                                {
                                    name: 'Usage',
                                    value: `\`${this?.props?.usage}\``,
                                    inline: true
                                },
                                {
                                    name: 'Example',
                                    value: `\`${this?.props?.example}\``,
                                    inline: true
                                },
                                {
                                    name: 'Cooldown',
                                    value: `\`${this?.props?.cooldown} seconds\``,
                                    inline: true
                                },
                                {
                                    name: 'Subcommands',
                                    value: subcommands?.join('\n'),
                                    inline: false
                                }
                            ]
                        })
                    ]
                })
            }
        }
    }
}
