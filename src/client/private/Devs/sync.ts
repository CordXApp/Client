import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"
import config from "../../../config/main.config"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "sync",
            description: "Refresh/reload a slash command",
            category: "Developers",
            cooldown: 5,
            ownerOnly: true,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: "command",
                    description: "The command to refresh",
                    required: true,
                    type: SubCommandOptions.String,
                },
                {
                    name: 'type',
                    description: 'Global or guild only command!',
                    required: true,
                    type: SubCommandOptions.String,
                    choices: [
                        {
                            name: 'Global',
                            value: 'global'
                        },
                        {
                            name: 'Guild',
                            value: 'guild'
                        }
                    ]
                }
            ],
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {
        const cmd = await interaction.options.getString("command");
        const global = await interaction.options.getString("type");

        switch (global) {

            case 'global': {
               
                let exists = await client.commands.get(cmd as string);

                if (!exists) return interaction.reply({
                    ephemeral: false,
                    embeds: [
                        new client.Embeds({
                            title: "Error: Invalid Command",
                            description:
                                "The command you provided is invalid. Please try again.",
                            color: client.config.EmbedColors.error,
                        }),
                    ],
                })

                await interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Refreshing Command',
                            description: `I\'m refreshing that command for you, please wait...`,
                            color: client.config.EmbedColors.base,
                            thumbnail: client.config.Icons.loading
                        })
                    ]
                })

                setTimeout(async () => {

                    await client?.restApi?.refreshSlashCommand(cmd as string)
                    .catch(async (e: Error) => {

                        await client.logs.error(`Error while refreshing slash command "${cmd}": ${e.message}`)

                        return interaction.editReply({
                            embeds: [
                                new client.Embeds({
                                    title: 'Error: Refreshing Command',
                                    description: `There was an error while refreshing the command: ${e.stack}`,
                                    color: client.config.EmbedColors.error
                                })
                            ]
                        })
                    })

                    await interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Command Refreshed',
                                description: `The command \`${cmd}\` was refreshed successfully, this message will be automatically deleted shortly!`,
                                color: client.config.EmbedColors.success
                            })
                        ]
                    })

                    setTimeout(() => {
                        interaction.deleteReply()
                    }, 2500)
                }, 5000)
            }

            break;

            case 'guild': {

                let cmd_exists = await client.private.get(cmd as string);

                if (!cmd_exists) return interaction.reply({
                    ephemeral: false,
                    embeds: [
                        new client.Embeds({
                            title: "Error: Invalid Command",
                            description:
                                "The command you provided is invalid. Please try again.",
                            color: client.config.EmbedColors.error,
                        }),
                    ],
                })

                await interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Refreshing Command',
                            description: `I\'m refreshing that command for you, please wait...`,
                            color: client.config.EmbedColors.base,
                            thumbnail: client.config.Icons.loading
                        })
                    ]
                })

                setTimeout(async () => {

                    await client?.restApi?.refreshPrivateCommand(cmd as string)
                    .catch(async (e: Error) => {

                        await client.logs.error(`Error while refreshing private command "${cmd}": ${e.message}`);

                        return interaction.editReply({
                            embeds: [
                                new client.Embeds({
                                    title: 'Error: Refreshing Command',
                                    description: `There was an error while refreshing the command: ${e.stack}`,
                                    color: client.config.EmbedColors.error
                                })
                            ]
                        })
                    })

                    await interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Command Refreshed',
                                description: `The command \`${cmd}\` was refreshed successfully, this message will be automatically deleted shortly!`,
                                color: client.config.EmbedColors.success
                            })
                        ]
                    })

                    setTimeout(() => {
                        interaction.deleteReply()
                    }, 2500)
                }, 5000)
            }
        }
    }
}
