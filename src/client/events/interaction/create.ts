import Discord, { Collection, ApplicationCommandOptionType } from "discord.js"
import type { CacheType, Interaction, BaseInteraction, PermissionResolvable } from "discord.js"
import { BasePermissions } from "../../../types/database/users";
import EventBase from "../../../schemas/Event.schema"
import type CordX from "../../CordX"

export default class InteractionCreate extends EventBase {
    constructor() {
        super({ name: "interactionCreate" })
    }

    public async execute(
        client: CordX,
        interaction: Interaction<CacheType>,
        int: BaseInteraction,
    ): Promise<any> {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName)
            const priv = client.private.get(interaction.commandName)

            const cmd = command || priv

            if (!cmd) return

            const { permissions } = cmd.props;
            const userId = interaction.member?.user.id as string;

            if (permissions.gate) {
                const perms = await client.utils.permissions.gate(userId, permissions.gate);

                if (!perms.success) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: invalid permissions',
                            color: client.config.EmbedColors.error,
                            description: perms?.message,
                            fields: [{
                                name: 'Missing permissions',
                                value: perms?.missing,
                                inline: true
                            }]
                        })
                    ]
                })
            }

            const args: any = []

            for (let option of interaction.options.data) {
                if (option.type === ApplicationCommandOptionType.Subcommand) {
                    if (option.name) args.push(option.name)
                    option.options?.forEach((x: any) => {
                        if (x.value) args.push(x.value)
                    })
                } else if (option.value) args.push(option.value)
            }

            try {
                cmd.execute(client, interaction, args)
            } catch (err: any) {
                client.logs.error(
                    `Error while executing command ${cmd.props.name}: ${err.stack}`,
                )
                return interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                })
            }
        }
    }
}
