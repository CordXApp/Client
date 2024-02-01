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
                },
                {
                    name: 'download',
                    description: 'Download your CordX/ShareX config.',
                    example: '/config download',
                    type: SubCommandOptions.SubCommand,
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

                return interaction.reply({
                    ephemeral: true,
                    content: `\`\`\`json
                    {
                        "Version": "14.1.0",
                        "Name": "CordX",
                        "DestinationType": "ImageUploader, FileUploader",
                        "RequestMethod": "POST",
                        "RequestURL": "https://cordx.lol/api/upload/sharex",
                        "Headers": {
                           "userid": "${interaction?.user?.id}",
                           "secret": "you can find this using the /profile command."
                        },
                        "Body": "MultipartFormData",
                        "FileFormName": "sharex",
                        "URL": "{json:url}"
                    }\`\`\``,
                }); 
            }

            case 'download': {

                const user = await client.api.request('GET', `users/profile/${interaction?.user?.id}/${process.env.API_SECRET}`)

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
