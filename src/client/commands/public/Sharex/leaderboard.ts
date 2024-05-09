import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../../schemas/Command.schema"
import { SubCommandOptions } from "../../../../types/client/utilities";
import { User } from "../../../../types/database/users";
import type CordX from "../../../CordX"

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
                base: {
                    user: ['SendMessages', 'EmbedLinks'],
                    client: ['SendMessages', 'EmbedLinks']
                }
            }
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        interaction.reply({
            embeds: [
                new client.Embeds({
                    title: '🔄 Stats: fetching leaderboard',
                    description: 'I am gathering the data, please wait....',
                    thumbnail: client.config.Icons.loading,
                    color: client.config.EmbedColors.base,
                })
            ]
        })

        Promise.all([client.utils.base.delay(10000), client.db.stats.leaderboard()]).then(async ([_, leaderboard]) => {

            if (!leaderboard.success) return interaction.editReply({
                embeds: [
                    new client.Embeds({
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
                    new client.Embeds({
                        title: '🏆 Leaderboard: top uploaders',
                        description: 'Here is our top 5 uploaders based on their total uploads.',
                        color: client.config.EmbedColors.base,
                        fields: [...fields]
                    })
                ]
            })
        })
    }
}