import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"

export default class About extends SlashBase {
    constructor() {
        super({
            name: "invite",
            description: "Get my invite link!",
            usage: "/invite",
            example: "/invite",
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
                    title: "Invite Me!",
                    description:
                        "Woah, you want me in your server? That's awesome!",
                    color: client.config.EmbedColors.base,
                    fields: [
                        {
                            name: "Invite Link",
                            value: `[Click Here](https://discord.com/api/oauth2/authorize?client_id=${client?.user?.id}&permissions=50550288547649&scope=bot%20applications.commands)`,
                            inline: true,
                        },
                    ],
                }),
            ],
        })
    }
}
