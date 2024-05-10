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
                gate: ['OWNER', 'DEVELOPER', 'ADMIN'],
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
                    ephemeral: true,
                    embeds: [
                        new client.Embeds({
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

                const update = await client.perms.user.update({
                    user: user?.id as string,
                    perm: perm as GatePermissions
                });

                if (!update.success) return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.Embeds({
                            title: 'Error: failed to update permissions',
                            description: `${update.message}`,
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Success: permissions updated',
                            description: `${update.message}`,
                            color: client.config.EmbedColors.base,
                            fields: [{
                                name: 'Added',
                                value: `${update.data.added || 'No permissions added'}`,
                                inline: false
                            }, {
                                name: 'Removed',
                                value: `${update.data.removed || 'No permissions removed'}`,
                                inline: false
                            }]
                        })
                    ]
                })
            }
        }
    }
}
