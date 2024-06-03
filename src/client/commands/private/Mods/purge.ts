import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import { Responses } from "../../../../types/database/index";
import type CordX from "../../../cordx"

export default class Purge extends SlashBase {
    constructor() {
        super({
            name: "purge",
            description: "Purge/delete a specific amount of messages from the current channel.",
            category: "Moderators",
            cooldown: 5,
            permissions: {
                gate: ['ADMIN', 'STAFF', 'SUPPORT'],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
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

        const amount = interaction.options.getNumber('amount', true);
        const channel = interaction.options.getChannel('channel', false)?.id as string || interaction.channelId as string;

        const initialMessage = await interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: 'Purge: executing task',
                    description: `Please wait while i attempt to purge ${amount} message(s) from <#${channel}>`,
                    thumbnail: client.config.Icons.loading,
                    color: client.config.EmbedColors.warning
                })
            ],
            fetchReply: true
        })

        return Promise.all([client.utils.base.delay(10000), client.utils.base.purgeMessages(channel, amount, initialMessage.id)])
            .then(async ([_, res]) => {
                if (!res.success) return interaction.editReply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: "Error: Purge failed",
                            description: `${res.message}`,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                })

                await interaction.editReply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: "Success: Purge complete",
                            description: `${res.message}`,
                            color: client.config.EmbedColors.success,
                        })
                    ]
                })

                return setTimeout(() => interaction.deleteReply(), 5000);
            });
    }
}
