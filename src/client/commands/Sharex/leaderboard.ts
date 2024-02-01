import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import { SubCommandOptions } from "../../../types/utilities";
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
            options: [
                {
                    name: 'amount',
                    description: 'Amount of users to show',
                    type: SubCommandOptions.Integer, 
                    required: false,
                }
            ]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {
        const amount = interaction.options.getInteger('amount') || 5;
        const leaderboard: any = await client.sql.getTopUploaders({ amount});

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
            if (!leaderboard.success) return interaction.editReply({
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
                    name: `${r.position} - ${r.globalName || r.username}`,
                    value: `Total Uploads: \`${r.imageCount}\``,
                    inline: false
                }
            });

            let title = ''

            if (amount == 1) title = 'Here is our top user based on their upload count!'
            else if (amount == 2) title = 'Here is our top 2 users based on their upload count!'
            else if (amount == 3) title = 'Here is our top 3 users based on their upload count!'
            else if (amount == 4) title = 'Here is our top 4 users based on their upload count!'
            else if (amount == 5) title = 'Here is our top 5 users based on their upload count!'

    
            return interaction.editReply({
                embeds: [
                    new client.Embeds({
                        title: 'Upload Leaderboard',
                        description: title,
                        color: client.config.EmbedColors.base,
                        fields: [...fields]
                    })
                ]
            })
        }, 3000)
    }
}
