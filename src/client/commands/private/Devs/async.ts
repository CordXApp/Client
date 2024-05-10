import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, type CacheType, type ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema";
import { SyncAll } from "../../../../types/spaces/files"
import type CordX from "../../../cordx"

export default class aSync extends SlashBase {
    constructor() {
        super({
            name: "async",
            description: "Execute various admin level sync operations!",
            category: "Developers",
            cooldown: 5,
            permissions: {
                gate: ['DEVELOPER'],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [
                {
                    name: "command",
                    description: "The command to refresh",
                    type: SubCommandOptions.SubCommand,
                    options: [{
                        name: 'name',
                        description: 'The name of the command to refresh',
                        required: true,
                        type: SubCommandOptions.String
                    }, {
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
                    }]
                },
                {
                    name: 'buckets',
                    description: 'Sync the bucket data for all users.',
                    type: SubCommandOptions.SubCommand,
                }
            ],
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'command': {

                const name = interaction.options.getString('name');
                const type = interaction.options.getString('type');

                const command = type === 'global' ? client.commands.get(name as string) : client.private.get(name as string);

                if (!command) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: command not found',
                            description: `Are you sure i have a command with that name :thinking:`,
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                await interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Admin: sync command',
                            description: `Preparing to sync a ${type} command`,
                            color: client.config.EmbedColors.base,
                            thumbnail: client.config.Icons.loading,
                        })
                    ]
                })

                setTimeout(() => {
                    interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Update: compiling command',
                                description: 'Compiling the Command ID and other data.',
                                color: client.config.EmbedColors.warning,
                                thumbnail: client.config.Icons.loading
                            })
                        ]
                    })
                }, 5000)

                setTimeout(() => {
                    interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Update: establishing connection',
                                description: 'Establishing connection with the Discord API.',
                                color: client.config.EmbedColors.warning,
                                thumbnail: client.config.Icons.loading
                            })
                        ]
                    })
                }, 10000)

                setTimeout(() => {
                    interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Update: connection successful',
                                description: `Syncing the ${type} command now!`,
                                color: client.config.EmbedColors.warning,
                                thumbnail: client.config.Icons.loading
                            })
                        ]
                    })
                }, 15000)

                const action = type === 'global' ? client.restApi.refreshSlashCommand(name as string) : client.restApi.refreshPrivateCommand(name as string)
                const cmdId = type === 'global' ? await client.restApi.getCommandID(name as string) : await client.restApi.getPrivateCommandID(name as string);

                Promise.all([client.utils.base.delay(20000), action]).then(() => {

                    return interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Admin: command sync complete',
                                description: `Successfully synced command with the Discord API.`,
                                color: client.config.EmbedColors.base,
                                fields: [{
                                    name: 'ID',
                                    value: `\`${cmdId}\``,
                                    inline: true

                                }, {
                                    name: 'Name',
                                    value: `\`${name}\``,
                                    inline: true
                                }, {
                                    name: 'Type',
                                    value: type === 'global' ? 'Public' : 'Private',
                                    inline: true
                                }]
                            })
                        ]
                    })
                }).catch((err: Error) => {
                    client.logs.error(err.stack as string);
                    return interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Error: command sync failed',
                                description: `Failed to sync command \`${name}\` with the Discord API.`,
                                color: client.config.EmbedColors.error,
                                fields: [{
                                    name: 'Error message',
                                    value: err.message,
                                    inline: false
                                }]
                            })
                        ]

                    })
                })
            }

                break;

            case 'buckets': {
                const confirm: any = new ButtonBuilder()
                    .setCustomId('agree')
                    .setLabel('🔄 Continue')
                    .setStyle(ButtonStyle.Danger)

                const cancel: any = new ButtonBuilder()
                    .setCustomId('disagree')
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Primary)

                const row: any = new ActionRowBuilder()
                    .addComponents(confirm, cancel)

                const message = await interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Admin: sync all buckets',
                            description: `Are you sure you want to sync/re-sync all bucket data? this will take a while and could result in data loss if the bot crashes.`,
                            color: client.config.EmbedColors.base,
                        })
                    ],
                    components: [row]
                })

                const filter = (i: any) => i.user && i.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 15000
                })

                collector.on('collect', async (result) => {

                    if (result.customId === 'agree') {

                        interaction.editReply({
                            embeds: [
                                new client.Embeds({
                                    title: 'Admin: syncing all buckets',
                                    description: `Please wait while i execute the task at hand.`,
                                    color: client.config.EmbedColors.base,
                                    thumbnail: client.config.Icons.loading
                                })
                            ],
                            components: []
                        })

                        const promise = Promise.all([client.utils.base.delay(300000), client.spaces.actions.sync_all()])
                            .then(async ([, status]: [unknown, { results: SyncAll }]) => {

                                await interaction.editReply({
                                    embeds: [
                                        new client.Embeds({
                                            title: 'Admin: bucket sync complete',
                                            description: `All available data has been synced for a total of \`${status.results.users}\` users!`,
                                            color: client.config.EmbedColors.success,
                                            fields: [{
                                                name: '✅ Synced',
                                                value: `${status.results.synced} synced files`,
                                                inline: false
                                            }, {
                                                name: '⏭️ Skipped',
                                                value: `${status.results.skipped} skipped files`,
                                                inline: false
                                            }, {
                                                name: '🗑️ Deleted',
                                                value: `${status.results.deleted} deleted files`,
                                                inline: false
                                            }, {
                                                name: '❓ Missing',
                                                value: `${status.results.muser} users missing a bucket`,
                                            }, {
                                                name: '❌ Failed',
                                                value: `${status.results.failed} errors occurred`,
                                                inline: false
                                            }, {
                                                name: '🔢 Total',
                                                value: `${status.results.synced + status.results.skipped + status.results.deleted + status.results.failed} total files processed`,
                                                inline: false
                                            }]
                                        })
                                    ],
                                    components: []
                                })

                                collector.stop();
                            })

                        client.db.emitter.on('progress', (results) => {
                            interaction.editReply({
                                embeds: [
                                    new client.Embeds({
                                        title: 'Admin: syncing all buckets',
                                        description: `Syncing data for ${results.user}...`,
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
                                            name: '❓ Missing',
                                            value: `${results.muser} users missing a bucket`,
                                        }, {
                                            name: '❌ Failed',
                                            value: `${results.failed} errors occurred`,
                                            inline: false
                                        }, {
                                            name: '🔢 Total',
                                            value: `${results.synced + results.skipped + results.deleted + results.failed} total files processed`,
                                            inline: false
                                        }]
                                    })
                                ],
                                components: []
                            })
                        })

                        await promise;

                        collector.stop();
                    } else if (result.customId === 'disagree') {

                        await interaction.editReply({
                            embeds: [
                                new client.Embeds({
                                    title: 'Admin: sync all buckets',
                                    description: `Cancelled the sync opeartion (this was probably a smart idea)`,
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
                                    title: 'Admin: sync user bucket',
                                    description: `No reaction was collected, cancelling the bucket sync`,
                                    color: client.config.EmbedColors.error
                                })
                            ]
                        })

                        setTimeout(() => {
                            interaction.deleteReply()
                        }, 15000)

                        collector.stop()
                    }

                    collector.stop()
                })
            }
        }
    }
}
