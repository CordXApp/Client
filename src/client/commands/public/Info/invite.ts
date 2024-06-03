import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashBase } from "../../../../schemas/command.schema";
import type CordX from "../../../bruhh";

export default class Invite extends SlashBase {
    constructor() {
        super({
            name: 'invite',
            description: 'Invite me to your server!',
            category: 'Info',
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        return interaction.reply({
            content: `Woahh, you want to invite me to your server? Thats\'s awesome! You can do that [here](https://discord.com/oauth2/authorize?client_id=${client.user?.id})`
        })
    }
}