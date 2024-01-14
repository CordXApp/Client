import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"

export default class Bugs extends SlashBase {
    constructor() {
        super({
            name: "bugs",
            description: "Information about where and how to submit bug reports.",
            usage: "/bugs",
            example: "/bugs",
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
                    title: 'Bug Reports',
                    description: 'If you find a bug in our api, website, discord bot or any other service we provide, you can use the methods below to report it.',
                    color: client.config.EmbedColors.base, 
                    fields: [
                        {
                            name: 'Discord Server',
                            value: 'You can join our [discord server](https://discord.gg/k2QAfkwDwK) and report bugs in our support channel.',
                            inline: true
                        },
                        {
                            name: 'Github Issues',
                            values: 'You can also report bugs through our [github discussions](https://github.com/orgs/CordXApp/discussions/categories/bug-reports)',
                            inline: true
                        }
                    ]
                })
            ]
        })
    }
}