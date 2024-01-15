import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import mysql from 'serverless-mysql';
import type CordX from "../../CordX"

export default class Leaderboard extends SlashBase {
    constructor() {
        super({
            name: "leaderboard",
            description: "View our top 5 uploaders!",
            usage: "/leaderboard",
            example: "/leaderboard",
            category: "Sharex",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        const leaderboard: any = await client.sql.topFiveUploaders();

        await interaction.reply({
            embeds: [
                new client.Embeds({
                    title: 'Upload Leaderboard',
                    description: 'Guess it\'s time for some mathematics, please wait...',
                    color: client.config.EmbedColors.base,
                    thumbnail: client.config.Icons.loading
                })
            ]
        })

        setTimeout(() => {
            if (!leaderboard.success) return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Upload Leaderboard',
                        description: 'Failed to fetch leaderboard!',
                        color: client.config.EmbedColors.error,
                        fields: [
                            {
                                name: 'Error',
                                value: `\`\`\`${leaderboard.data || 'Something just ain\'t right 🤷‍♂️'}\`\`\``
                            }
                        ]
                    })
                ]
            })
    
            const fields = leaderboard.data.map((r: any) => {
                return {
                    name: `${r.position} - ${r.username || r.globalName}`,
                    value: `Total Uploads: \`${r.imageCount}\``,
                    inline: false
                }
            });
    
            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Upload Leaderboard',
                        description: 'Here is our top 5 users based on their upload count!',
                        color: client.config.EmbedColors.base,
                        fields: [...fields]
                    })
                ]
            })
        }, 5000)
    }
}
