import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import type CordX from "../../CordX"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "diagnostics",
            description: "View and manage the CordX Error/Diagnostic system (better known as Snaily).",
            category: "Diagnostics",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'view',
                    description: 'View a Snaily Report (ID REQUIRED).',
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'id',
                            description: 'The ID of the Snaily Report.',
                            type: SubCommandOptions.String,
                            required: true
                        }
                    ]
                },
            ]
        })
    }

    public async execute(client: CordX, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'view': {

                const id = interaction.options.getString('id')!
                const snaily = await client.snaily.getDiagnosticReport(id);

                if (id.length > 8) return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.Embeds({
                            title: `Snaily: Invalid ID`,
                            description: `Hold up chief, that ID is too long. Please provide only the first **8** characters of a  valid Snaily Report ID.`,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                })

                if (!snaily.success) return interaction.reply({ content: snaily.message, ephemeral: true });

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: `Snaily Report: ${snaily.report.reportId.slice(0, 8)}`,
                            description: `\`\`\`json\n${JSON.stringify(snaily.report.error.stack, null, 2)}\`\`\``,
                            color: client.config.EmbedColors.base,
                        })
                    ]
                });
            }
        }
    }
}
