import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, type CacheType, type ChatInputCommandInteraction } from "discord.js"
import { EmitterResponse, SpacesResponse } from "../../../../types/modules/spaces"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema";
import type CordX from "../../../cordx"

export default class aSync extends SlashBase {
    constructor() {
        super({
            name: "async",
            description: "Execute various admin level sync operations!",
            category: "Developers",
            cooldown: 5,
            permissions: {
                gate: ['OWNER', 'DEVELOPER'],
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
                    options: [{
                        name: 'force',
                        description: 'Force the sync operation',
                        required: true,
                        type: SubCommandOptions.Boolean
                    }]
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
                        new client.EmbedBuilder({
                            title: 'Error: command not found',
                            description: `Are you sure i have a command with that name :thinking:`,
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
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
                            new client.EmbedBuilder({
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
                            new client.EmbedBuilder({
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
                            new client.EmbedBuilder({
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
                            new client.EmbedBuilder({
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
                            new client.EmbedBuilder({
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

                const force = interaction.options.getBoolean('force');

                if (force === true && !client.db.modules.perms.user.has({
                    user: interaction.user.id,
                    perm: 'OWNER'
                })) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: access denied',
                            description: 'Hey there chief, to prevent issues or accidental screw ups forcing this action is only available to my owner(s)',
                            color: client.config.EmbedColors.base
                        })
                    ]
                })

                const row: any = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder().setCustomId('agree').setLabel('🔄 Sync Buckets').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('disagree').setLabel('❌ Cancel Sync').setStyle(ButtonStyle.Primary)
                    ])

                const message = await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
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

                return client.utils.base.handleFullSync(collector, interaction, force as boolean);
            }
        }
    }
}
