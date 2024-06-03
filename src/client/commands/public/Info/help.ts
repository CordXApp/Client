import { pagination, ButtonTypes, ButtonStyles } from "@devraelfreeze/discordjs-pagination";
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
        interaction: any
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

        const info = new client.EmbedBuilder({
            title: 'Help: info commands',
            description: 'Here is a list of all my info commands!',
            color: client.config.EmbedColors.base,
            fields: [{
                name: 'Commands',
                value: client.commands.category('Info').map((cmd) => cmd.props.name).join(', '),
                inline: true
            }]
        });

        const sharex = new client.EmbedBuilder({
            title: 'Help: sharex commands',
            description: 'Here is a list of all my sharex commands!',
            color: client.config.EmbedColors.base,
            fields: [{
                name: 'Commands',
                value: client.commands.category('Sharex').map((cmd) => cmd.props.name).join(', '),
                inline: true
            }]
        });

        const support = new client.EmbedBuilder({
            title: 'Help: support commands',
            description: 'Here is a list of all my support commands!',
            color: client.config.EmbedColors.base,
            fields: [{
                name: 'Commands',
                value: client.commands.category('Support').map((cmd) => cmd.props.name).join(', '),
                inline: true
            }]
        });

        const users = new client.EmbedBuilder({
            title: 'Help: user commands',
            description: 'Here is a list of all my user commands!',
            color: client.config.EmbedColors.base,
            fields: [{
                name: 'Commands',
                value: client.commands.category('Users').map((cmd) => cmd.props.name).join(', '),
                inline: true
            }]
        });

        return pagination({
            interaction: interaction,
            embeds: [info, sharex, support, users],
            author: interaction.member.user,
            disableButtons: false,
            fastSkip: true,
            ephemeral: false,
            time: 30000,
            buttons: [{
                type: ButtonTypes.previous,
                label: 'Previous',
                style: ButtonStyles.Secondary,
                emoji: '⬅️'
            }, {
                type: ButtonTypes.next,
                label: 'Next',
                style: ButtonStyles.Primary,
                emoji: '➡️'
            }]
        })
    }
}