import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema";
import type CordX from "../../../cordx";

export default class Profile extends SlashBase {
    constructor() {
        super({
            name: 'profile',
            description: 'View your profile information and statistics!',
            category: 'Users',
            cooldown: 5,
            permissions: {
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'help',
                description: 'Get help with the profile command!',
                example: '/profile help',
                type: SubCommandOptions.SubCommand
            }, {
                name: 'stats',
                description: 'View your cordx statistics',
                type: SubCommandOptions.SubCommand
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'help': {

                const subCommands = await this.props.options?.map((option) => {
                    return `• \`${option?.example}\` - ${option?.description}`
                })

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Profile Command Help',
                            description: `Below are the available profile subcommands and their usage.`,
                            color: client.config.EmbedColors.base,
                            fields: [{
                                name: 'Usage',
                                value: `\`${this.props.usage || 'None'}\``,
                                inline: true
                            }, {
                                name: 'Example',
                                value: `\`${this.props.example || 'None'}\``,
                                inline: true
                            }, {
                                name: 'Cooldown',
                                value: `\`${this.props.cooldown} seconds\``,
                                inline: true
                            }, {
                                name: 'Subcommands',
                                value: subCommands?.join('\n'),
                                inline: false
                            }]
                        })
                    ]
                })
            }

            case 'stats': {

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: fetch profile stats',
                            description: 'Please wait while i fetch your statistics',
                            thumbnail: client.config.Icons.loading,
                            color: client.config.EmbedColors.base
                        })
                    ]
                });

                return Promise.all([client.utils.base.delay(5000), client.db.modules.spaces.stats.profile(interaction.user.id)]).then(async ([, res]) => {

                    if (!res.success) return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: failed to fetch profile',
                                description: `${res.message}`,
                                color: client.config.EmbedColors.error
                            })
                        ]
                    })

                    const { bucket, database } = res.data.storage;
                    const { png, gif, mp4, other, total } = res.data.files;

                    return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Success: profile found',
                                description: 'Here is your profile/upload statistics',
                                author: {
                                    name: `${interaction.user.globalName}`,
                                    iconURL: interaction.user.displayAvatarURL(),
                                    url: `https://cordximg.host/users/${interaction.user.id}`
                                },
                                color: client.config.EmbedColors.success,
                                fields: [{
                                    name: 'ℹ️ Bucket Size',
                                    value: `**Approx**: ${bucket}`,
                                    inline: true
                                }, {
                                    name: 'ℹ️ Database Size',
                                    value: `**Approx**: ${database}`,
                                    inline: true
                                }, {
                                    name: '📁 Bucket Files',
                                    value: `**Total**: ${total}`,
                                    inline: true
                                }, {
                                    name: '📁 File Breakdown',
                                    value: `🖼️ PNG\'s: ${png} | 🎞️ GIF\'s: ${gif} | 📹 Video\'s: ${mp4} | ❔ Other: ${other}`,
                                    inline: false
                                }]
                            })
                        ]
                    })
                });
            }
        }
    }
}