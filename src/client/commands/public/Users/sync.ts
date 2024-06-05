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

                return Promise.all([client.utils.base.delay(5000), client.modules.spaces.actions.check(interaction.user.id)]).then(async ([, res]) => {

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

                const row: any = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder().setCustomId('agree').setLabel('🔄 Sync bucket').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('disagree').setLabel('❌ Cancel sync').setStyle(ButtonStyle.Secondary)
                    ])

                const message = await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Sync: user bucket',
                            description: 'Are you sure you want to sync your bucket content? This process can and will take a while!',
                            color: client.config.EmbedColors.warning,
                            fields: [{
                                name: 'Notice',
                                value: `- This action could result in data loss if anything goes wrong\n- We recommend setting the \`force\` option to false, please go back and make sure you did that!`,
                                inline: false
                            }]
                        })
                    ],
                    components: [row]
                });

                const filter = (i: any) => i.user && i.user.id === interaction.user.id
                const collector = message.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 30000
                });

                return client.utils.base.handleUserSync(collector, interaction, force as boolean);
            }
        }
    }
}