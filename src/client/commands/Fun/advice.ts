import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"

export default class Advice extends SlashBase {
    constructor() {
        super({
            name: "advice",
            description: "Get some possibly useful advice.",
            usage: "/advice",
            example: "/advice",
            category: "Fun",
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

        await client.api.generateAdvice().then((data) => {
            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Here is your advice!',
                        description: data,
                        color: client.config.EmbedColors.base
                    })
                ]
            })
        }).catch((e: Error) => {
                
                console.log(e.stack)
    
                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error',
                            description: `An error occurred while trying to get some advice.`,
                            color: client.config.EmbedColors.error,
                            fields: [
                                { name: 'Error:', value: `\`${e.message}\``, inline: true }
                            ]
                        })
                    ]
                })
        })
    }
}