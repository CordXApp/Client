import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SlashBase } from "../../../schemas/Command.schema"
import { SubCommandOptions } from "../../../types/utilities";
import type CordX from "../../CordX"

export default class Reports extends SlashBase {
    constructor() {
        super({
            name: "reports",
            description: "Create, view and manage your reports.",
            usage: "/reports <subcommand>",
            example: "/reports create ",
            category: "Reports",
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


    }
}
