import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashBase } from "../../../../schemas/Command.schema";
import PKG from "../../../../../package.json";
import type CordX from "../../../CordX";
import { version } from "discord.js";

export default class About extends SlashBase {
    constructor() {
        super({
            name: 'about',
            description: 'Some information about me!',
            category: 'Info',
            cooldown: 5,
            permissions: {
                base: {
                    user: ['SendMessages', 'EmbedLinks'],
                    client: ['SendMessages', 'EmbedLinks']
                }
            }
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: 'About Me 🤖',
                    description: 'Hey there, I am CordX a Simple Application made to make your life easier while interacting with the CordX Website',
                    color: client.config.EmbedColors.base,
                    fields: [{
                        name: 'Created',
                        value: `${client.user?.createdAt.toDateString()}`,
                        inline: true
                    }, {
                        name: 'Developer(s)',
                        value: `[View our team](https://cordx.lol/team)`,
                        inline: true
                    }, {
                        name: 'Source',
                        value: `[GitHub](https://github.com/CordXApp/Client)`,
                        inline: true
                    }, {
                        name: 'Library',
                        value: `Discord.js v${version}`,
                        inline: true
                    }, {
                        name: 'Client',
                        value: `${client.user?.username} v${PKG.version}`,
                        inline: true
                    }]
                })
            ]
        })
    }
}