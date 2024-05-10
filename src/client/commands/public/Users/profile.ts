import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema";
import { Report } from "../../../../types/database/reports";
import { reports } from "@prisma/client";
import type CordX from "../../../cordx";

export default class Profile extends SlashBase {
    constructor() {
        super({
            name: 'profile',
            description: 'View your profile information and statistics!',
            category: 'Users',
            cooldown: 5,
            permissions: {
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: []
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {



        }
    }
}