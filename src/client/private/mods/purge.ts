import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../../client/CordX"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "purge",
            description: "Purge/delete a specific amount of messages from the current channel.",
            category: "Moderators",
            cooldown: 5,
            ownerOnly: true,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: "amount",
                    description: "The amount of messages to purge (1 - 100).",
                    required: true,
                    type: SubCommandOptions.Number,
                },
                {
                    name: 'channel',
                    description: 'The channel to purge messages from (default: current channel).',
                    required: false,
                    type: SubCommandOptions.Channel,
                },
            ],
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        const amount = interaction.options.getNumber("amount");
        const channel = interaction.options.getChannel("channel")?.id as string || interaction.channel?.id as string;
        const remove = await client.utils.purgeMessages(channel as string, amount as number)

        await interaction.deferReply();

        if (!remove.success) return interaction.followUp({
            embeds: [
                new client.Embeds({
                    title: 'Error: failed to purge messages',
                    description: 'If this error persists, please contact our support team.',
                    color: client.config.EmbedColors.base,
                    fields: [
                        {
                            name: 'Error Message',
                            value: remove.message,
                            inline: false
                        }
                    ]
                })
            ]
        })

        await interaction.followUp({
            embeds: [
                new client.Embeds({
                    title: 'Purge successful',
                    description: `${remove.message}`,
                    color: client.config.EmbedColors.base,
                })
            ]
        })

        return setTimeout(async () => {
            await interaction.deleteReply()
        }, 5000)
    }
}
