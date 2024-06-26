import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, type CacheType, type ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SpacesResponse } from "../../../../types/modules/spaces";
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "sync",
            description: "Execute various sync operations for your account!",
            usage: "/sync <subCommand>",
            example: "/sync bucket",
            category: "Users",
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'bucket',
                description: 'Sync/re-sync your bucket files',
                options: [{
                    name: 'force',
                    description: 'Force the sync operation',
                    type: SubCommandOptions.Boolean,
                    required: true
                }],
                type: SubCommandOptions.SubCommand,
            }, {
                name: 'check',
                description: 'Check if your bucket needs to be synced!',
                type: SubCommandOptions.SubCommand
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'check': {

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: check sync status',
                            description: 'Checking if your bucket needs to be synced!',
                            thumbnail: client.config.Icons.loading,
                            color: client.config.EmbedColors.warning
                        })
                    ]
                });

                return Promise.all([client.utils.base.delay(5000), client.spaces.actions.check(interaction.user.id)]).then(async ([, res]) => {

                    if (!res.success) return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: failed to check sync status',
                                description: res.message,
                                color: client.config.EmbedColors.error
                            })
                        ]
                    });

                    return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Success: status check complete',
                                description: res.message,
                                color: client.config.EmbedColors.base
                            })
                        ]
                    })
                })

            }

            case 'bucket': {

                const force = interaction.options.getBoolean('force');

                const row: any = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder().setCustomId('agree').setLabel('🔄 Sync bucket').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('disagree').setLabel('❌ Cancel sync').setStyle(ButtonStyle.Secondary)
                    ])

                const message = await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Sync: user bucket',
                            description: 'Are you sure you want to re-sync your bucket? this will take a while and could result in data loss if something goes wrong!',
                            color: client.config.EmbedColors.base
                        })
                    ],
                    components: [row]
                })

                const filter = (i: any) => i.user && i.user.id === interaction.user.id
                const collector = message.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 30000,
                })

                collector.on('collect', async (result) => {

                    if (result.customId === 'agree') {

                        interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Sync: user bucket',
                                    description: 'Please wait while i execute the task at hand!',
                                    thumbnail: client.config.Icons.loading,
                                    color: client.config.EmbedColors.warning
                                })
                            ],
                            components: []
                        })

                        client.spaces.emitter.on('progress', async (results) => {
                            interaction.editReply({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'Update: still working on it',
                                        description: `${results.message}`,
                                        thumbnail: client.config.Icons.loading,
                                        color: client.config.EmbedColors.warning,
                                        fields: [{
                                            name: '⏭️ Progress',
                                            value: `${results.percentage}`,
                                            inline: false
                                        }, {
                                            name: '🔢  Total',
                                            value: `${results.total}`,
                                            inline: false
                                        }]
                                    })
                                ]
                            })
                        })

                        const syncUserPromise = client.spaces.actions.sync_user(interaction.user.id, force as boolean);

                        syncUserPromise.then(async (res: { results: SpacesResponse }) => {
                            if (!res.results.success) {
                                return interaction.editReply({
                                    embeds: [
                                        new client.EmbedBuilder({
                                            title: 'Sync: operation failed',
                                            description: res.results.message,
                                            color: client.config.EmbedColors.error
                                        })
                                    ],
                                    components: []
                                });
                            }

                            await client.utils.base.delay(60000);

                            await interaction.editReply({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'Sync: operation successful',
                                        description: 'All your available bucket files have been synced successfully!',
                                        color: client.config.EmbedColors.base
                                    })
                                ],
                                components: []
                            });

                            collector.stop();
                        }).catch((err: Error) => {

                            return interaction.editReply({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'Sync: operation failed',
                                        description: err.message,
                                        color: client.config.EmbedColors.error
                                    })
                                ],
                                components: []
                            })
                        });

                        collector.stop();
                    } else if (result.customId === 'disagree') {

                        await interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Sync: operation cancelled',
                                    description: 'Cancelled the sync operation (this was probably a smart idea)',
                                    color: client.config.EmbedColors.error
                                })
                            ],
                            components: []
                        })

                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 10000)

                        collector.stop();
                    }
                })

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Sync: operation timed out',
                                    description: 'You took too long to respond, the operation has been cancelled!',
                                    color: client.config.EmbedColors.error
                                })
                            ],
                            components: []
                        })

                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 10000)

                        collector.stop();
                    }

                    return collector.stop();
                })
            }
        }
    }
}