import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "webhook",
            description: "Manage our saved webhooks (used for proxy)",
            category: "Developers",
            cooldown: 5,
            permissions: {
                gate: ['OWNER'],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [
                {
                    name: "create",
                    description: "Migrate all users to the new schema.",
                    type: SubCommandOptions.SubCommand,
                    options: [{
                        name: 'id',
                        description: 'The webhook ID',
                        type: SubCommandOptions.String,
                        required: true
                    }, {
                        name: 'token',
                        description: 'The webhook token',
                        type: SubCommandOptions.String,
                        required: true
                    }, {
                        name: 'name',
                        description: 'The name/shortname for the webhook',
                        type: SubCommandOptions.String,
                        required: true
                    }]
                },
                {
                    name: 'fetch',
                    description: 'View a webhook by via its ID',
                    type: SubCommandOptions.SubCommand,
                    options: [{
                        name: 'name',
                        description: 'The webhook name',
                        type: SubCommandOptions.String,
                        required: true
                    }]
                }
            ],
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'create': {

                const id = interaction.options.getString('id');
                const token = interaction.options.getString('token');
                const name = interaction.options.getString('name');

                const create_hook = await client.db.webhook.create({
                    id: id as string,
                    token: token as string,
                    name: name as string,
                    enabled: true
                });

                if (!create_hook.success) return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: webhook creation failed',
                            color: client.config.EmbedColors.error,
                            description: `\`${create_hook.message}\``
                        })
                    ]
                })

                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Success: webhook created',
                            color: client.config.EmbedColors.success,
                            description: `I have created your new webhook \`${name}\`.`,
                        })
                    ]
                })
            }

            case 'fetch': {

                const name = interaction.options.getString('name');

                if (!name) return interaction.reply({
                    ephemeral: false,
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: missing arguments',
                            color: client.config.EmbedColors.error,
                            description: `Please provide a valid webhook name`
                        })
                    ]
                })



                const webhook = await client.db.webhook.fetch(name as string);

                if (!webhook.success) return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: webhook fetch failed',
                            color: client.config.EmbedColors.error,
                            description: `\`${webhook.message}\``
                        })
                    ]
                })

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: `Admin: webhook fetch`,
                            color: client.config.EmbedColors.base,
                            description: `Here is the information for your requested webhook!`,
                            fields: [{
                                name: 'ID',
                                value: webhook.data.id,
                                inline: true
                            }, {
                                name: 'Name',
                                value: webhook.data.name,
                                inline: true
                            }, {
                                name: 'Token',
                                value: webhook.data.token,
                                inline: true
                            }]
                        })
                    ]
                })
            }
        }
    }
}