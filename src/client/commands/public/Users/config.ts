import { CacheType, ChatInputCommandInteraction, AttachmentBuilder } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Profile extends SlashBase {
    constructor() {
        super({
            name: "config",
            description: "Manage your CordX/ShareX config.",
            usage: "/config <subCommand>",
            example: "/config view",
            category: "Config",
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
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
                    description: 'View your config',
                    type: SubCommandOptions.SubCommand,
                    options: [{
                        name: 'type',
                        description: 'Currently only sharex is available.',
                        type: SubCommandOptions.String,
                        required: false
                    }]
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
                        new client.EmbedBuilder({
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

                const type = interaction.options.getString('type');

                if (type !== 'sharex') {

                    return interaction.reply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: invalid type',
                                color: client.config.EmbedColors.error,
                                description: 'Sorry about that chief, we currently only support ShareX as an uploader!'
                            })
                        ]
                    })

                }

                const user = await client.db.entity.fetch({
                    entityId: interaction.user.id,
                    entity: 'User'
                })

                if (!user.success) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: profile not found',
                            color: client.config.EmbedColors.error,
                            description: 'Your profile could not be located at this time :thinking:'
                        })
                    ]
                })

                if (user.data?.domain === 'none' || user.data?.domain === null) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: domain not found',
                            color: client.config.EmbedColors.error,
                            description: 'You should have a domain set to view your config.'
                        })
                    ]
                })

                const config = await client.db.modules.configs.sharex.generate(user.data?.userid, user.data?.secret, user.data?.domain);
                const cfgString = JSON.stringify(config.data, null, 2);

                if (!config.success) return interaction.reply({
                    ephemeral: true,
                    content: `Error: ${config.message}`
                })

                return interaction.reply({
                    ephemeral: true,
                    content: "```json\n" + cfgString + "\n```"
                })
            }

            /**case 'download': {

                const user = await client.db.user.fetch(interaction.user.id);

                if (!user || !user.success) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: profile not found',
                            color: client.config.EmbedColors.error,
                            description: 'Your profile could not be located at this time :thinking:'
                        })
                    ]
                })

                interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: config generation',
                            color: client.config.EmbedColors.base,
                            description: 'Please wait while we generate your config',
                            thumbnail: client.config.Icons.loading
                        })
                    ]
                })

                setTimeout(() => {
                    interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Action: config generation',
                                color: client.config.EmbedColors.base,
                                description: 'Attempting to send your config to your DMs :mailbox_with_mail:',
                                thumbnail: client.config.Icons.loading
                            })
                        ]
                    })
                }, 10000)

                Promise.all([client.utils.base.delay(20000), client.api.generateUserConfig(interaction.user.id, user.data.secret, user.data.domain ? user.data.domain : null)])
                    .then(async ([_, config]) => {

                        if (!config) return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Error: config not found',
                                    color: client.config.EmbedColors.error,
                                    description: 'Your config could not be generated at this time :thinking:'
                                })
                            ]
                        })

                        const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(config)), {
                            name: `CordX.sxcu`,
                            description: 'Your CordX/ShareX config file.'
                        });

                        await interaction.user.send({
                            content: 'Your config file is ready for download :mailbox_with_mail:',
                            files: [attachment]
                        }).catch(() => {
                            return interaction.editReply({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'Error: unable to send DM',
                                        color: client.config.EmbedColors.error,
                                        description: 'Whoops, seems like i was unable to send you your config file :thinking: Please make sure your DMs are open and try again.',
                                    })
                                ]
                            })
                        })

                        return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Action: download config',
                                    color: client.config.EmbedColors.base,
                                    description: 'Your config has been sent to your DMs :mailbox_with_mail:, here is a preview!',
                                    fields: [{
                                        name: 'Name',
                                        value: config.Name,
                                        inline: true
                                    }, {
                                        name: 'Version',
                                        value: config.Version,
                                        inline: true
                                    }, {
                                        name: 'Destinations',
                                        value: config.DestinationType,
                                        inline: true
                                    }]
                                })
                            ]
                        })
                    })
            }*/
        }
    }
}
