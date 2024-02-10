import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"

export default class About extends SlashBase {
    constructor() {
        super({
            name: "help",
            description: "View my help message or get command info!",
            usage: "/help | /help <command>",
            example: "/help | /help ping",
            category: "Info",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: "command",
                    description: "The command you want to get info for!",
                    required: false,
                    type: 3,
                },
            ],
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {
        const cmd = await interaction.options.getString("command")

        if (cmd && !client.commands.get(cmd))
            return interaction.reply({
                content: "That command does not exist!",
                ephemeral: true,
            })
        else if (cmd && client.commands.get(cmd)) {
            const fetch = await client.commands.get(cmd)
            const name = fetch?.props.name

            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: `Command Info: ${name}`,
                        description: `${fetch?.props?.description}`,
                        color: client.config.EmbedColors.base,
                        fields: [
                            {
                                name: "Usage",
                                value: `${fetch?.props?.usage}`,
                                inline: true,
                            },
                            {
                                name: "Example",
                                value: `${fetch?.props?.example}`,
                                inline: true,
                            },
                        ],
                    }),
                ],
            })
        }

        return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: "Commands List",
                    description: `Here is a list of all my commands!`,
                    color: client.config.EmbedColors.base,
                    fields: [
                        {
                            name: "Info",
                            value: `${client.commands
                                .category("Info")
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        },
                        {
                            name: "Fun",
                            value: `${client.commands
                                .category('Fun')
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        },
                        {
                            name: 'Reports',
                            value: `${client.commands
                                .category('Reports')
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        },
                        {
                            name: 'ShareX',
                            value: `${client.commands
                                .category('Sharex')
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        },
                        {
                            name: 'Users',
                            value: `${client.commands
                                .category('Users')
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        },
                        {
                            name: 'Moderation',
                            value: `${client.private
                                .category('Moderators')
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        },
                        {
                            name: 'Devs',
                            value: `${client.private
                                .category('Developers')
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        },
                        {
                            name: 'System',
                            value: `${client.private
                                .category('System')
                                .map((cmd: any) => `\`${cmd.props.name}\``)
                                .join(" ")}`,
                            inline: true,
                        }
                    ],
                }),
            ],
        })
    }
}
