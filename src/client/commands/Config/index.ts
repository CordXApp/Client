import { CacheType, ChatInputCommandInteraction, AttachmentBuilder } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import { SubCommandOptions } from "../../../types/utilities"
import { UserStats } from "../../../types/user/stats"
import type CordX from "../../CordX"

export default class Profile extends SlashBase {
    constructor() {
        super({
            name: "config",
            description: "Manage your CordX/ShareX config.",
            usage: "/config <subCommand>",
            example: "/config view",
            category: "Info",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'help',
                    description: 'View the help menu.',
                    example: '/config help',
                    type: SubCommandOptions.SubCommand,
                    required: false,
                },
                {
                    name: 'view',
                    description: 'View your CordX/ShareX config.',
                    example: '/config stats',
                    type: SubCommandOptions.SubCommand,
                    required: false,
                    options: [
                        {
                            name: 'domain',
                            description: 'Use a custom domain with the config.',
                            usage: '/config view domain <domain>',
                            example: '/config view domain cordx.lol',
                            type: SubCommandOptions.String,
                            required: false
                        }
                    ]
                },
                {
                    name: 'download',
                    description: 'Download your CordX/ShareX config.',
                    example: '/config download',
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'domain',
                            description: 'Use a custom domain with the config.',
                            usage: '/config download domain <domain>',
                            example: '/config download domain cordx.lol',
                            type: SubCommandOptions.String,
                            required: false
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

            case 'view': {

                const user = await client.api.request('GET', `users/profile/${interaction?.user?.id}/${process.env.API_SECRET}`)
                const domain = interaction.options.getString('domain') as string;

                if (user.error) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: request failed',
                            description: 'There was an error while fetching your profile/data.',
                            color: client.config.EmbedColors.error,
                            fields: [
                                {
                                    name: 'Status',
                                    value: `\`${user?.status}\``,
                                    inline: false
                                },
                                {
                                    name: 'Message',
                                    value: `\`${user?.message}\``,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                if (domain) {

                    if (domain.includes('http://') || domain.includes('https://')) return interaction.reply({
                        content: 'Error: Please provide a valid domain without the protocol, we will add it for you internally.',
                        ephemeral: true
                    })

                    const check = await client.db.getOneUserDomain(interaction?.user?.id, domain);

                    if (!check.success) return interaction.reply({
                        content: `Error: ${check.message}`,
                        ephemeral: true
                    })

                    return interaction.reply({
                        ephemeral: true,
                        content: `\`\`\`json
                        {
                            "Version": "14.1.0",
                            "Name": "${domain}",
                            "DestinationType": "ImageUploader, FileUploader",
                            "RequestMethod": "POST",
                            "RequestURL": "https://${domain}/api/upload/sharex",
                            "Headers": {
                               "userid": "${interaction?.user?.id}",
                               "secret": "${user?.data?.secret}"
                            },
                            "Body": "MultipartFormData",
                            "FileFormName": "sharex",
                            "URL": "{json:url}"
                        }\`\`\``
                    })
                }

                return interaction.reply({
                    ephemeral: true,
                    content: `\`\`\`json
                    {
                        "Version": "14.1.0",
                        "Name": "cordx.lol",
                        "DestinationType": "ImageUploader, FileUploader",
                        "RequestMethod": "POST",
                        "RequestURL": "https://cordx.lol/api/upload/sharex",
                        "Headers": {
                           "userid": "${interaction?.user?.id}",
                           "secret": "${user?.data?.secret}"
                        },
                        "Body": "MultipartFormData",
                        "FileFormName": "sharex",
                        "URL": "{json:url}"
                    }\`\`\``,
                });
            }

            case 'download': {

                const user = await client.api.request('GET', `users/profile/${interaction?.user?.id}/${process.env.API_SECRET}`)
                const domain = interaction.options.getString('domain') as string;

                if (user.error) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: request failed',
                            description: 'There was an error while fetching your profile/data.',
                            color: client.config.EmbedColors.error,
                            fields: [
                                {
                                    name: 'Status',
                                    value: `\`${user?.status}\``,
                                    inline: false
                                },
                                {
                                    name: 'Message',
                                    value: `\`${user?.message}\``,
                                    inline: false
                                }
                            ]
                        })
                    ]
                })

                if (domain) {

                    if (domain.includes('http://') || domain.includes('https://')) return interaction.reply({
                        content: 'Error: Please provide a valid domain without the protocol, we will add it for you internally.',
                        ephemeral: true
                    })

                    const check = await client.db.getOneUserDomain(interaction?.user?.id, domain);

                    console.log(check)

                    if (!check.success) return interaction.reply({
                        content: `Error: ${check.message}`,
                        ephemeral: true
                    })

                    const config = await client.api.downloadBaseUserConfig(interaction?.user?.id, user?.data?.secret, domain);

                    if (!config) {
                        return interaction.reply({
                            ephemeral: true,
                            content: 'No data received from the server.',
                        });
                    }

                    const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(config)), {
                        name: 'CordX.sxcu',
                        description: 'Your CordX/ShareX config.'
                    });

                    return interaction.reply({
                        ephemeral: true,
                        files: [attachment]
                    })
                }

                const config = await client.api.downloadBaseUserConfig(interaction?.user?.id, user?.data?.secret);

                if (!config) {
                    return interaction.reply({
                        ephemeral: true,
                        content: 'No data received from the server.',
                    });
                }

                const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(config)), {
                    name: 'CordX.sxcu',
                    description: 'Your CordX/ShareX config.'
                });

                return interaction.reply({
                    ephemeral: true,
                    files: [attachment]
                })
            }
        }
    }
}
