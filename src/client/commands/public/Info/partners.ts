import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashBase } from "../../../../schemas/command.schema";
import { SubCommandOptions } from "../../../../types/client/utilities";
import { Partner } from "../../../../types/database/partners";
import type CordX from "../../../cordx";

export default class Partners extends SlashBase {
    constructor() {
        super({
            name: 'partners',
            description: 'View our partners!',
            category: 'Info',
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'list',
                description: 'View a list of all our partners',
                required: false,
                type: SubCommandOptions.SubCommand
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'list': {

                const list = await client.db.partner.list();

                if (!list.success) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: failed to fetch partners',
                            description: list.message,
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                const fields = await list.data.map((partner: Partner) => {
                    return {
                        name: partner.name,
                        value: `**About:** ${partner.bio}\n**Link:** [View](${partner.url})`,
                        inline: true
                    }
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Our Partners 🤝',
                            description: 'Alone we can do so little; together we can do so much.',
                            color: client.config.EmbedColors.base,
                            fields: [...fields]
                        })
                    ]
                })
            }
        }
    }
}