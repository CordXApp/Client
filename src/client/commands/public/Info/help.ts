import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema";
import type CordX from "../../../cordx";

export default class Help extends SlashBase {
    constructor() {
        super({
            name: 'help',
            description: 'View my help message or get help with a specific command!',
            category: 'Info',
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'command',
                description: 'The command you need help with',
                type: SubCommandOptions.String,
                required: false
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        const cmd = interaction.options.getString('command');

        if (cmd && !client.commands.get(cmd)) return interaction.reply({
            content: `I couldn't find a command with the name \`${cmd}\`!`,
            ephemeral: true
        });

        else if (cmd && client.commands.get(cmd)) {
            const fetch = await client.commands.get(cmd);
            const name = fetch?.props.name;

            return interaction.reply({
                embeds: [
                    new client.EmbedBuilder({
                        title: `Command Info: ${name}`,
                        description: fetch?.props.description,
                        color: client.config.EmbedColors.base,
                        fields: [{
                            name: 'Usage',
                            value: `${fetch?.props.usage || 'No usage provided'}`,
                            inline: true
                        }, {
                            name: 'Example(s)',
                            value: `${fetch?.props.example || 'No examples provided'}`,
                            inline: true
                        }]
                    })
                ]
            })
        }

        return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: 'CordX: Help Menu 📚',
                    description: `Here is a list of all my available commands, sorted by their categories!`,
                    color: client.config.EmbedColors.base,
                    fields: [{
                        name: 'Info Commands',
                        value: client.commands.category('Info').map((cmd) => cmd.props.name).join(', '),
                        inline: true
                    }, {
                        name: 'Config Commands',
                        value: client.commands.category('Config').map((cmd) => cmd.props.name).join(', '),
                        inline: true
                    }, {
                        name: 'ShareX Commands',
                        value: client.commands.category('Sharex').map((cmd) => cmd.props.name).join(', '),
                        inline: true
                    }, {
                        name: 'Support Commands',
                        value: client.commands.category('Support').map((cmd) => cmd.props.name).join(', '),
                        inline: true
                    }, {
                        name: 'User Commands',
                        value: client.commands.category('Users').map((cmd) => cmd.props.name).join(', '),
                        inline: true
                    }]
                })
            ]
        })
    }
}