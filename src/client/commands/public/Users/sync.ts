import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, type CacheType, type ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema"
import { SyncBucket } from "../../../../types/spaces/files";
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
                type: SubCommandOptions.SubCommand
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'bucket': {
                const row: any = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder().setCustomId('agree').setLabel('🔄 Sync bucket').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('disagree').setLabel('❌ Cancel sync').setStyle(ButtonStyle.Secondary)
                    ])

                const message = await interaction.reply({
                    embeds: [
                        new client.Embeds({
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
                                new client.Embeds({
                                    title: 'Sync: user bucket',
                                    description: 'Please wait while i execute the task at hand!',
                                    thumbnail: client.config.Icons.loading,
                                    color: client.config.EmbedColors.warning
                                })
                            ],
                            components: []
                        })

                        const promise = Promise.all([client.utils.base.delay(60000), client.spaces.actions.sync_user(interaction.user.id)])
                            .then(async ([, res]: [unknown, { results: SyncBucket }]) => {

                                await interaction.editReply({
                                    embeds: [
                                        new client.Embeds({
                                            title: 'Sync: operation successful',
                                            description: 'All your available bucket files have been synced successfully!',
                                            color: client.config.EmbedColors.base,
                                            fields: [{
                                                name: '✅ Synced',
                                                value: `${res.results.synced} synced files`,
                                                inline: false
                                            }, {
                                                name: '⏭️ Skipped',
                                                value: `${res.results.skipped} skipped files`,
                                                inline: false
                                            }, {
                                                name: '🗑️ Deleted',
                                                value: `${res.results.deleted} deleted files`,
                                                inline: false
                                            }, {
                                                name: '❌ Failed',
                                                value: `${res.results.failed} failed files`,
                                                inline: false
                                            }, {
                                                name: '🔢  Total',
                                                value: `${res.results.synced + res.results.skipped + res.results.deleted + res.results.failed} total files processed`,
                                                inline: false
                                            }]
                                        })
                                    ],
                                    components: []
                                })

                                collector.stop()
                            });

                        client.spaces.emitter.on('progress', async (results) => {
                            interaction.editReply({
                                embeds: [
                                    new client.Embeds({
                                        title: 'Update: still working on it',
                                        description: `${results.message}`,
                                        thumbnail: client.config.Icons.loading,
                                        color: client.config.EmbedColors.warning,
                                        fields: [{
                                            name: '✅ Synced',
                                            value: `${results.synced} synced files`,
                                            inline: false
                                        }, {
                                            name: '⏭️ Skipped',
                                            value: `${results.skipped} skipped files`,
                                            inline: false
                                        }, {
                                            name: '🗑️ Deleted',
                                            value: `${results.deleted} deleted files`,
                                            inline: false
                                        }, {
                                            name: '❌ Failed',
                                            value: `${results.failed} failed files`,
                                            inline: false
                                        }, {
                                            name: '🔢  Total',
                                            value: `${results.synced + results.skipped + results.deleted + results.failed} total files processed`,
                                            inline: false
                                        }]
                                    })
                                ]
                            })
                        })

                        await promise;

                        collector.stop();
                    } else if (result.customId === 'disagree') {

                        await interaction.editReply({
                            embeds: [
                                new client.Embeds({
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
                                new client.Embeds({
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