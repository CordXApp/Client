import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Purge extends SlashBase {
    constructor() {
        super({
            name: "purge",
            description: "Purge/delete a specific amount of messages from the current channel.",
            category: "Moderators",
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [
                {
                    name: "amount",
                    description: "The amount of messages to purge (1 - 100).",
                    required: true,
                    type: SubCommandOptions.Number,
                },
                {
                    name: 'channel',
                    description: 'The channel to purge messages from (default: current channel).',
                    required: false,
                    type: SubCommandOptions.Channel,
                },
            ],
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {


    }
}
