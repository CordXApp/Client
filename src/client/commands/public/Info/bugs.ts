import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashBase } from "../../../../schemas/command.schema";
import type CordX from "../../../bruhh";

export default class Bugs extends SlashBase {
    constructor() {
        super({
            name: 'bugs',
            description: 'Information regarding where and how to submit a bug report!',
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
            embeds: [
                new client.EmbedBuilder({
                    title: 'Bug Reports',
                    description: 'If you find one of those pesky bugs, please report it using one of the methods below!',
                    color: client.config.EmbedColors.base,
                    fields: [{
                        name: 'Support Server',
                        value: `You can join our [Discord Server](https://cordximg.host/discord) and report bugs in one of our support channels.`,
                        inline: true
                    }, {
                        name: 'GitHub Issues',
                        value: `You can also report bugs through our [GitHub Discussions](https://github.com/orgs/CordXApp/discussions/categories/bug-reports)`,
                        inline: true
                    }, {
                        name: 'Report Command',
                        value: `If you aren\'t happy with the methods above, you can also use the \`/report\` command to report a bug directly to the developers.`,
                        inline: true
                    }]
                })
            ]
        })
    }
}