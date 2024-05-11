import { type CacheType, type ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema";
import { GatePermissions } from "../../../../types/database/users"
import type CordX from "../../../cordx"

export default class aSync extends SlashBase {
    constructor() {
        super({
            name: "aperms",
            description: "Update or remove a users CordX Permissions (ADMIN ONLY)",
            category: "Developers",
            cooldown: 5,
            permissions: {
                gate: ['OWNER', 'DEVELOPER'],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'update',
                description: 'Update a staff members permissions.',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'user',
                    description: 'The user to update permissions for.',
                    type: SubCommandOptions.User,
                    required: true
                }, {
                    name: 'perm',
                    description: 'The permissions to assign/remove',
                    type: SubCommandOptions.String,
                    required: true
                }]
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case "update": {

                const user = interaction.options.getUser('user');
                const perm = interaction.options.getString('perm');
                const valid = ['ADMIN', 'STAFF', 'SUPPORT', 'DEVELOPER']

                if (!valid.includes(perm as string)) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid permission(s)',
                            description: 'Whoops, you provided a invalid permission string, please provide one of the valid permissions listed below (yes it needs to be uppercase)!',
                            color: client.config.EmbedColors.error,
                            fields: [{
                                name: 'Valid Permissions',
                                value: valid.join(', '),
                                inline: false
                            }, {
                                name: 'Provided Permission',
                                value: `${perm}`,
                                inline: false
                            }]
                        })
                    ]
                })

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: update permissions',
                            description: `Updating permissions for ${user?.globalName}...`,
                            thumbnail: client.config.Icons.loading,
                            color: client.config.EmbedColors.base
                        })
                    ]
                })

                return Promise.all([client.utils.base.delay(10000), client.perms.user.update({
                    user: user?.id as string,
                    perm: perm as GatePermissions
                })]).then(async ([, res]) => {

                    if (!res.success) return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: failed to update permissions',
                                description: 'Whoops, we failed to update the permissions for the user, please try again later!',
                                color: client.config.EmbedColors.error
                            })
                        ]
                    })

                    return interaction.editReply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Success: updated permissions',
                                description: `Successfully updated permissions for ${user?.globalName}!`,
                                color: client.config.EmbedColors.success,
                                fields: [{
                                    name: 'Added',
                                    value: `${res.data.added || 'None'}`,
                                    inline: false
                                }, {
                                    name: 'Removed',
                                    value: `${res.data.removed || 'None'}`,
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
