import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"

export default class System extends SlashBase {
    constructor() {
        super({
            name: "system",
            description: "Base for all of our system commands.",
            category: "System",
            cooldown: 10,
            ownerOnly: false,
            usage: '/system <subcommand>',
            example: '/system help',
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'help',
                    description: 'Help menu for the system commands.',
                    example: '/system help',
                    required: false,
                    type: SubCommandOptions.SubCommand
                },
                {
                    name: 'stats',
                    description: 'View stats for either the bot or our website.',
                    example: '/system stats',
                    required: false,
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'type',
                            description: 'The type of stats you want to view.',
                            example: ' /system stats bot',
                            required: true,
                            type: SubCommandOptions.String,
                            choices: [
                                {
                                    name: 'Bot',
                                    value: 'bot'
                                },
                                {
                                    name: 'Website',
                                    value: 'website'
                                }
                            ],
                        }
                    ]
                },
                {
                    name: 'versions',
                    description: 'View the versions of all of our systems.',
                    example: '/system versions',
                    required: false,
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'branch',
                            description: 'Which branch of the versions you want to view.',
                            example: '/system versions branch',
                            required: true,
                            type: SubCommandOptions.String,
                            choices: [
                                {
                                    name: 'Current',
                                    value: 'current'
                                },
                                {
                                    name: 'Newest',
                                    value: 'newest'
                                },
                                {
                                    name: 'Stable',
                                    value: 'stable'
                                }
                            ]
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

        switch(interaction.options.getSubcommand()) {

            case 'help': {

                const subcommands = await this?.props?.options?.map((option) => {
                    return `\`${option?.example}\` - ${option?.description}`
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'System Help',
                            description: 'Here are all of the system commands and their usage.',
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

            case 'stats': {
                const method = interaction.options.get('type')?.value;

                if (method == 'bot') {
                    return interaction.reply({
                        embeds: [
                            new client.Embeds({
                                title: 'CordX: Bot Stats',
                                description: `Here are my stats chief.`,
                                color: client.config.EmbedColors.base,
                                fields: [
                                    {
                                        name: 'Users',
                                        value: `\`${client.users.cache.size}\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Channels',
                                        value: `\`${client.channels.cache.size}\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Guilds',
                                        value: `\`${client.guilds.cache.size}\``,
                                        inline: true
                                    }
                                ]
                            })
                        ]
                    })
                } else {
                    client.System.Statistics().then((data) => {
                        return interaction.reply({
                            embeds: [
                                new client.Embeds({
                                    title: 'CordX: Website Stats',
                                    description: `Here are our website stats chief.`,
                                    color: client.config.EmbedColors.base,
                                    fields: [
                                        {
                                            name: 'Users',
                                            //@ts-ignore
                                            value: `\`${data?.users}\` - Total Users`,
                                            inline: true
                                        },
                                        {
                                            name: 'Images',
                                            //@ts-ignore
                                            value: `\`${data?.images}\` - Total Images`,
                                            inline: true
                                        },
                                        {
                                            name: 'Downloads',
                                            //@ts-ignore
                                            value: `\`${data?.downloads}\` - Total Downloads`,
                                            inline: true
                                        }
                                    ]
                                })
                            ]
                        })
                    }).catch((e: Error) => {
                        return interaction.reply({
                            embeds: [
                                new client.Embeds({
                                    title: 'CordX: Website Stats',
                                    description: `There was an error fetching the stats.`,
                                    color: client.config.EmbedColors.error,
                                    fields: [
                                        {
                                            name: 'Error',
                                            value: `\`${e.message}\``,
                                            inline: true
                                        }
                                    ]
                                })
                            ]
                        })
                    });
                }
            }

            break;

            case 'versions': {

                const branch = interaction.options.get('type')?.value;
                const versions = await client.System.Versions();
                const current = versions.current;
                const newest = versions.newest;
                const stable = versions.stable;

                const api = "https://github.com/CordXApp/API";
                const bot = "https://github.com/CordXApp/Client";
                const dns = "https://github.com/CordXApp/DNS";
                const docs = "https://github.com/CordXApp/Documentation";
                const proxy = "https://github.com/CordXApp/Proxy";
                const web = "https://cordx.lol";

                switch(interaction.options.get('branch')?.value) {
                    
                    case 'current': {
                        return interaction.reply({
                            embeds: [
                                new client.Embeds({
                                    title: 'CordX: Current Versions',
                                    description: `Here are the current versions of all of our systems.`,
                                    color: client.config.EmbedColors.base,
                                    fields: [
                                        {
                                            name: 'API',
                                            value: `[${current.api}](${api})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Bot',
                                            value: `[${current.client}](${bot})`,
                                            inline: true
                                        },
                                        {
                                            name: 'DNS',
                                            value: `[${current.dns}](${dns})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Documentation',
                                            value: `[${current.documentation}](${docs})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Proxy',
                                            value: `[${current.proxy}](${proxy})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Website',
                                            value: `[${current.website}](${web})`,
                                            inline: true
                                        }
                                    ]
                                })
                            ]
                        })
                    }

                    case 'newest': {
                        return interaction.reply({
                            embeds: [
                                new client.Embeds({
                                    title: 'CordX: Newest Versions',
                                    description: `Here are the newest versions of all of our systems.`,
                                    color: client.config.EmbedColors.base,
                                    fields: [
                                        {
                                            name: 'API',
                                            value: `[${newest.api}](${api})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Bot',
                                            value: `[${newest.client}](${bot})`,
                                            inline: true
                                        },
                                        {
                                            name: 'DNS',
                                            value: `[${newest.dns}](${dns})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Documentation',
                                            value: `[${newest.documentation}](${docs})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Proxy',
                                            value: `[${newest.proxy}](${proxy})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Website',
                                            value: `[${newest.website}](${web})`,
                                            inline: true
                                        }
                                    ]
                                })
                            ]
                        })
                    }

                    case 'stable': {
                        return interaction.reply({
                            embeds: [
                                new client.Embeds({
                                    title: 'CordX: Stable Versions',
                                    description: `Here are the stable versions of all of our systems.`,
                                    color: client.config.EmbedColors.base,
                                    fields: [
                                        {
                                            name: 'API',
                                            value: `[${stable.api}](${api})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Bot',
                                            value: `[${stable.client}](${bot})`,
                                            inline: true
                                        },
                                        {
                                            name: 'DNS',
                                            value: `[${stable.dns}](${dns})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Documentation',
                                            value: `[${stable.documentation}](${docs})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Proxy',
                                            value: `[${stable.proxy}](${proxy})`,
                                            inline: true
                                        },
                                        {
                                            name: 'Website',
                                            value: `[${stable.website}](${web})`,
                                            inline: true
                                        }
                                    ]
                                })
                            ]
                        })
                    }
                }
            }

            break;

            default: {
                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'CordX: System',
                            description: 'Whoops, you used a invalid subcommand. Please use the `/system help` to see all available subcommands.',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                })
            }
        }
    }
}
