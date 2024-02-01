import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import { SubCommandOptions } from "../../../types/utilities"
import type CordX from "../../CordX"

export default class EightBall extends SlashBase {
    constructor() {
        super({
            name: "8ball",
            description: "Ask the 8ball a question and it will answer it for you.",
            usage: "/8ball <question>",
            example: "/8ball Is CordX the best bot?",
            category: "Fun",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'question',
                    description: 'What do you want to ask the 8ball?',
                    type: SubCommandOptions.String,
                    required: true
                }
            ]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        const question = interaction.options.getString('question');

        await client.api.eightBall(question as string).then((data) => {
            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Magic 8ball',
                        color: client.config.EmbedColors.base,
                        thumbnail: client.config.Icons.eightBall,
                        description: 'Here is the answer to your question:',
                        fields: [
                            { name: 'Question:', value: question, inline: true },
                            { name: 'Answer:', value: data, inline: true }
                        ]
                    })
                ]
            })
        }).catch((e: Error) => {

            console.log(e.stack)

            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Error',
                        color: client.config.EmbedColors.error,
                        description: `An error occurred while trying to ask the 8ball a question.`,
                        fields: [
                            { name: 'Error:', value: `\`${e.message}\``, inline: true}
                        ]
                    })
                ]
            })
        })
    }
}