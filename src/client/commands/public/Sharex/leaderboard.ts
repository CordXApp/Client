import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema"
import { User } from "../../../../types/database/users";
import type CordX from "../../../bruhh"

export default class Leaderboard extends SlashBase {
    constructor() {
        super({
            name: "leaderboard",
            description: "View our top uploaders.",
            usage: "/leaderboard",
            example: "/leaderboard",
            category: "Sharex",
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'amount',
                description: 'The top uploader count (1 - 15)',
                type: SubCommandOptions.Number,
                required: true
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        const amount = interaction.options.getNumber('amount', true)

        interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: '🔄 Stats: fetching leaderboard',
                    description: 'I am gathering the data, please wait....',
                    thumbnail: client.config.Icons.loading,
                    color: client.config.EmbedColors.base,
                })
            ]
        })

        Promise.all([client.utils.base.delay(10000), client.db.stats.model.leaderboard(amount)]).then(async ([_, leaderboard]) => {

            if (!leaderboard.success) return interaction.editReply({
                embeds: [
                    new client.EmbedBuilder({
                        title: '🚫 Error: failed to fetch leaderboard',
                        description: `Error: \`${leaderboard.message}\``,
                        color: client.config.EmbedColors.error,
                    })
                ]
            })

            const fields = await leaderboard.data.map((user: User) => {
                return {
                    name: `${user.position} - ${user.globalName || user.username}`,
                    value: `Total uploads: ${user.total}`,
                    inline: false
                }
            })

            return interaction.editReply({
                embeds: [
                    new client.EmbedBuilder({
                        title: '🏆 Leaderboard: top uploader(s)',
                        description: `Here is our top ${amount === 1 ? 'uploader' : 'uploaders'} based on the total amount of files they have uploaded to CordX!`,
                        color: client.config.EmbedColors.base,
                        fields: [...fields]
                    })
                ]
            })
        })
    }
}