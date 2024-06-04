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
                    description: 'Delete and re-sync all files!',
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
                                title: 'Failed: maybe it\'s an error!',
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

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: sync bucket files',
                            description: 'Syncing your bucket files! I\'ll send you a DM once it\'s done!',
                            color: client.config.EmbedColors.warning
                        })
                    ]
                });

                await client.spaces.actions.sync_user(interaction.user.id, force as boolean).then(async (res: SpacesResponse) => {

                    if (!res.success) return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: failed to sync bucket files',
                                description: res.message,
                                color: client.config.EmbedColors.error
                            })
                        ]
                    });

                    return interaction.user.createDM(true).then(dm => {
                        return dm.send({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Success: bucket files synced',
                                    description: res.message,
                                    color: client.config.EmbedColors.base
                                })
                            ]
                        }).catch((err: Error) => {
                            client.logs.debug(err.stack as string);
                            return interaction.editReply({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'Error: failed to notify user!',
                                        description: "For some reason i was unable to notify you but at this point the action has most likely completed! You can run `/sync check` to verify!",
                                        color: client.config.EmbedColors.error
                                    })
                                ]
                            });
                        });
                    })
                }).catch((err: Error) => {
                    client.logs.debug(err.stack as string);
                    return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: failed to sync bucket files',
                                description: err.message,
                                color: client.config.EmbedColors.error
                            })
                        ]
                    });
                });

                return interaction.editReply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Success: bucket files synced',
                            description: 'Notification sent successfully!',
                            color: client.config.EmbedColors.base
                        })
                    ]
                })
            }
        }
    }
}