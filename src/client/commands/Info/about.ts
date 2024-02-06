import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"

export default class About extends SlashBase {
    constructor() {
        super({
            name: "about",
            description: "Some information about the bot.",
            usage: "/about",
            example: "/about",
            category: "Info",
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

        return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: 'About Me',
                    description: 'Hey there, I am CordX, and i am designed to make your life easier and help you out with whatever you may need in terms of using the CordX Services.',
                    color: client.config.EmbedColors.base,
                    fields: [
                        {
                            name: 'Created On',
                            value: client.user?.createdAt.toDateString(),
                            inline: true
                        },
                        {
                            name: 'Created By',
                            value: `[CordX Team](https://cordx.lol/team)`,
                            inline: true
                        },
                        {
                            name: 'Support Server',
                            value: `[CordX Support](https://cordx.lol/discord)`,
                            inline: true
                        },
                        {
                            name: 'Ping',
                            value: `${client.ws.ping}ms`,
                            inline: true
                        }
                    ]
                })
            ]
        })
    }
}