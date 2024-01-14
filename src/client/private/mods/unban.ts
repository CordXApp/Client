import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../../client/CordX"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "unban",
            description: "Unban a user from the server",
            category: "Moderators",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'userid',
                    description: 'The id of the user to unban',
                    required: true,
                    type: SubCommandOptions.User
                },
                {
                    name: 'reason',
                    description: 'The reason for unbanning the user',
                    required: false,
                    type: SubCommandOptions.String
                }
            ]
        })
    }

    public async execute(client: CordX, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {


    }
}