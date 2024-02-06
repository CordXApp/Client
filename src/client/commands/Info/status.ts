import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"
import { SubCommandOptions } from "../../../types/utilities"

export default class Status extends SlashBase {
    constructor() {
        super({
            name: "status",
            description: "View the uptime and status for our services or yours.",
            category: "Info",
            cooldown: 10,
            usage: '/status <subcommand>',
            example: '/status cordx',
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'help',
                    description: 'View the help menu for the status command.',
                    usage: '/status help',
                    example: '/status help',
                    type: SubCommandOptions.SubCommand,
                    required: false
                },
                {
                    name: 'cordx',
                    description: 'View the uptime and status for CordX.',
                    usage: '/status cordx',
                    example: '/status cordx',
                    type: SubCommandOptions.SubCommand,
                    required: false,
                    options: [
                        {
                            name: 'service',
                            description: 'The service you want to check.',
                            type: SubCommandOptions.String,
                            required: true,
                            choices: [
                                {
                                    name: 'API',
                                    value: 'https://api.cordx.lol',
                                },
                                {
                                    name: 'DNS',
                                    value: 'https:/dns.cordx.lol',
                                },
                                {
                                    name: 'Docs',
                                    value: 'https://help.cordx.lol',
                                },
                                {
                                    name: 'Proxy',
                                    value: 'https://proxy.cordx.lol',
                                },
                                {
                                    name: 'Website',
                                    value: 'https://cordx.lol',
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'custom',
                    description: 'View the uptime and status for a custom domain.',
                    usage: '/status custom <domain>',
                    example: '/status custom https://example.com',
                    type: SubCommandOptions.SubCommand,
                    required: false,
                    options: [
                        {
                            name: 'domain',
                            description: 'The domain you want to check.',
                            type: SubCommandOptions.String,
                            required: true
                        }
                    ]
                }
            ]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'help': {

                const subcommands = await this?.props?.options?.map((option) => {
                    return `\`${option?.example}\` - ${option?.description}`
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Profile Help',
                            description: 'Below are the available subcommands and their usage.',
                            color: client.config.EmbedColors.base,
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

            case 'cordx': {
                const service = interaction.options.get('service')?.value;

                await interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Checking Service Status',
                            description: `Please wait while we get the results.`,
                            color: client.config.EmbedColors.base,
                            thumbnail: client.config.Icons.loading,
                            fields: [
                                {
                                    name: 'Service',
                                    value: `${service}`,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                Promise.all([client.utils.delay(5000), client.utils.getServiceStatus(service as string)]).then(([_, data]) => {

                    client.logs.info(JSON.stringify(data))

                    return interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Service Status',
                                description: `Below are the details for: ${service}`,
                                color: client.config.EmbedColors.base,
                                fields: [
                                    {
                                        name: 'Status',
                                        value: `${data.response.available ? "🟢 ONLINE" : "🔴 OFFLINE"}`,
                                        inline: false
                                    },
                                    {
                                        name: 'Check Started',
                                        value: `${data.response.started}`,
                                        inline: false
                                    },
                                    {
                                        name: 'Check Ended',
                                        value: `${data.response.ended}`,
                                        inline: false
                                    },
                                    {
                                        name: 'Response Time',
                                        value: `${data.response.responseTime} seconds`,
                                        inline: false
                                    },
                                    {
                                        name: 'Round Trip',
                                        value: `${data.response.roundTrip}ms`,
                                        inline: false
                                    }
                                ]
                            })
                        ]
                    })
                }).catch((e: Error) => {
                    client.logs.error(`Failed to check status for ${service}! | ${e.stack}`)

                    return interaction.editReply({
                        content: `Failed to check status for ${service}!`
                    })
                });
            }

                break;

            case 'custom': {
                const domain = interaction.options.getString('domain')

                if (!client.utils.isValidHttpUrl(domain as string)) return interaction.reply({
                    content: 'Invalid domain provided, you must include `http://` or `https://` protocol.',
                    ephemeral: true
                })

                await interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Checking Service Status',
                            description: `Please wait while we get the results.`,
                            color: client.config.EmbedColors.base,
                            thumbnail: client.config.Icons.loading,
                            fields: [
                                {
                                    name: 'Domain',
                                    value: `${domain}`,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                Promise.all([client.utils.delay(5000), client.utils.getServiceStatus(domain as string)]).then(([_, data]) => {

                    client.logs.info(JSON.stringify(data))

                    return interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Custom Service Status',
                                description: `Below are the details for: ${domain}`,
                                color: client.config.EmbedColors.base,
                                fields: [
                                    {
                                        name: 'Status',
                                        value: `${data.response.available ? "🟢 ONLINE" : "🔴 OFFLINE"}`,
                                        inline: false
                                    },
                                    {
                                        name: 'Check Started',
                                        value: `${data.response.started}`,
                                        inline: false
                                    },
                                    {
                                        name: 'Check Ended',
                                        value: `${data.response.ended}`,
                                        inline: false
                                    },
                                    {
                                        name: 'Response Time',
                                        value: `${data.response.responseTime} seconds`,
                                        inline: false
                                    },
                                    {
                                        name: 'Round Trip',
                                        value: `${data.response.roundTrip}ms`,
                                        inline: false
                                    }
                                ]
                            })
                        ]
                    })
                }).catch((e: Error) => {
                    client.logs.error(`Failed to check status for ${domain}! | ${e.stack}`)

                    return interaction.editReply({
                        content: `Failed to check status for ${domain}!`
                    })
                })
            }

                break;

            default: {
                return interaction.reply({
                    content: 'Invalid subcommand provided, please use `/status help` for more information.',
                    ephemeral: true
                })
            }
        }
    }
}
