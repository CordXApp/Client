import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import { SubCommandOptions } from "../../../types/utilities";
import type CordX from "../../CordX"

export default class Upload extends SlashBase {
    constructor() {
        super({
            name: "upload",
            description: "Upload an image to our server!",
            usage: "/upload",
            example: "/upload",
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

        return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: 'Woah: you found a secret command!',
                    description: 'This command is still in development, please wait for an announcement regarding its release!',
                    color: client.config.EmbedColors.warning,
                })
            ]
        })
    }
}
