import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class System extends SlashBase {
    constructor() {
        super({
            name: "system",
            description: "Base for all of our system commands.",
            category: "System",
            cooldown: 10,
            usage: '/system <subcommand>',
            example: '/system help',
            permissions: {
                base: {
                    user: ['SendMessages'],
                    client: ['SendMessages']
                }
            },
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
                },
                {
                    name: 'rules',
                    description: 'Send our server rules message.',
                    example: '/system rules',
                    required: false,
                    type: SubCommandOptions.SubCommand
                },
                {
                    name: 'info',
                    description: 'Send our server info message.',
                    example: '/system info',
                    required: false,
                    type: SubCommandOptions.SubCommand
                }
            ],
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

                switch (interaction.options.get('branch')?.value) {

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

            case 'rules': {

                const member = await interaction.guild?.members.cache.get(interaction.user.id);

                if (!member?.permissions.has('ManageGuild')) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'CordX: System',
                            description: 'You do not have the required permissions to run this command.',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                })

                const admins = await interaction.guild?.roles.fetch('871275518794801193');
                const mods = await interaction.guild?.roles.fetch('1136100365243260959');

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Server Rules',
                            description: 'Here are the rules for our server, please make sure to follow them.',
                            color: client.config.EmbedColors.base,
                            fields: [
                                {
                                    name: '1️⃣. Support',
                                    value: 'Please do not mention or DM any of our server, staff or support team members unless you have a valid reason to do so. If you need help, please open a ticket in the <#1201632969845112912> channel or ask the community for help in <#1134399965150597240>',
                                    inline: false
                                },
                                {
                                    name: '2️⃣. Spamming',
                                    value: 'Please do not spam in any of the channels, this includes sending multiple messages in a short period of time or sending the same message multiple times.',
                                    inline: false
                                },
                                {
                                    name: '3️⃣. NSFW Content',
                                    value: 'Please do not send any NSFW content in any of the channels, this includes images, videos, links or text.',
                                    inline: false
                                },
                                {
                                    name: '4️⃣. Advertising',
                                    value: 'Please do not advertise any other Discord servers, websites, products or services in any of the channels.',
                                    inline: false
                                },
                                {
                                    name: '5️⃣. Respect',
                                    value: 'Treat others in this server with respect, everyone here is equal and no one is worth less than another. If you got a problem with someone, either report them to our moderation team or take it to dm\'s.Violation of this rule will result in a 24 hour ban from the server, violating the rule again afterwards will result in a permanent ban from the server.',
                                    inline: false
                                },
                                {
                                    name: '6️⃣. Language',
                                    value: 'Please keep the language in the server to English only, this is to ensure that everyone can understand each other.',
                                    inline: false
                                },
                                {
                                    name: '7️⃣. Bots',
                                    value: 'Please do not spam commands in any of the channels, this includes commands for any of the bots in the server.',
                                    inline: false
                                },
                                {
                                    name: '8️⃣. Moderation',
                                    value: `Please do not argue with the moderation team, if you have a problem with a moderation action, please report it to a ${admins} team member and they will look into it.`,
                                    inline: false
                                },
                                {
                                    name: '9️⃣. Alt Accounts',
                                    value: 'We do not allow alt accounts in our server as a way to evade bans or mutes. If they’re being used in a respectful manor to communicate in our server however is totally fine',
                                    inline: false
                                },
                                {
                                    name: '🔟. Rule Loopholes',
                                    value: 'Please do not try to find loopholes in the rules, if you are caught doing so, you will be punished accordingly.',
                                    inline: false
                                },
                                {
                                    name: '🔁. Punishments',
                                    value: 'If you violate any of the rules, you will be punished accordingly. This can range from a warning to a permanent ban from the server.',
                                    inline: false
                                },
                                {
                                    name: '🔢. Reporting',
                                    value: `If you see someone breaking the rules, please report them to a member of the ${admins} or ${mods} team and they will look into it.`,
                                    inline: false
                                },
                                {
                                    name: '🔡. Appeals',
                                    value: 'If you feel like you have been punished unfairly, you can appeal your punishment in the <#1201632969845112912> channel.',
                                    inline: false
                                },
                                {
                                    name: '🔠. Staff',
                                    value: 'Please do not ask to become a staff member, we will reach out to you if we feel like you would be a good fit for our team.',
                                    inline: false
                                },
                                {
                                    name: '🔡. Info',
                                    value: '***We may add new rules, remove existing ones or change existing ones at any given time when we feel necessary. Please check back here regularly to stay up-to-date to the rules.***',
                                    inline: false
                                },
                                {
                                    name: '🔚. Conclusion',
                                    value: 'Please make sure to follow the rules and have a great time in our server.',
                                    inline: false
                                }
                            ]
                        })
                    ]
                })
            }

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
