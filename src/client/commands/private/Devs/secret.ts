import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Sync extends SlashBase {
    constructor() {
        super({
            name: "secret",
            description: "Create a secret to use with the CordX API",
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
                    description: "Create a new API Secret for authentication",
                    type: SubCommandOptions.SubCommand,
                },
                {
                    name: 'view',
                    description: 'View an API Secret via the Secret ID',
                    type: SubCommandOptions.SubCommand,
                    options: [{
                        name: 'id',
                        description: 'The secret id',
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

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: create secret',
                            description: `Generating a new API Secret, please wait...`,
                            thumbnail: client.config.Icons.loading,
                            color: client.config.EmbedColors.warning
                        })
                    ]
                })

                return Promise.all([client.utils.base.delay(5000), client.db.secret.create()])
                    .then(async ([_, res]) => {

                        if (!res.success) return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: "Error: secret creation failed",
                                    description: `${res.message}`,
                                    color: client.config.EmbedColors.error,
                                })
                            ]
                        })

                        await interaction.user.createDM(true).then(async(dm) => {
                            await dm.send({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'Your new API Secret!',
                                        description: 'Please do not share or abuse this secret.',
                                        color: client.config.EmbedColors.success,
                                        fields: [{
                                            name: 'Secret ID',
                                            value: `${res.data.id}`,
                                            inline: false
                                        },{
                                            name: 'Secret Key',
                                            value: `${res.data.key}`,
                                            inline: false
                                        }]
                                    })
                                ]
                            })
                        })

                        return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Success: secret generated',
                                    description: `I have generated a new secret for you and sent it to your DM\'s, please do not leak, share or abuse this secret in any way!`,
                                    color: client.config.EmbedColors.success,
                                })
                            ]
                        })
                    });
            }

            case 'view': {

                const secretId = interaction.options.getString('id', true);

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: view secret',
                            description: `Please wait while i look for the secret you requested!`,
                            thumbnail: client.config.Icons.loading,
                            color: client.config.EmbedColors.warning
                        })
                    ]
                })

                return Promise.all([client.utils.base.delay(5000), client.db.secret.view(secretId)])
                    .then(async ([_, res]) => {

                        if (!res.success) return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: "Error: failed to fetch",
                                    description: `${res.message}`,
                                    color: client.config.EmbedColors.error,
                                })
                            ]
                        })

                        await interaction.user.createDM(true).then(async(dm) => {
                            await dm.send({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'View: api secret',
                                        description: 'Please do not share or abuse this secret.',
                                        color: client.config.EmbedColors.success,
                                        fields: [{
                                            name: 'Secret',
                                            value: `${await client.db.secret.decrypt(res.data.secret)}`,
                                            inline: false
                                        }]
                                    })
                                ]
                            })
                        })

                        return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Success: secret sent',
                                    description: `I was able to locate that secret, please check your DM\'s as i have sent it there!`,
                                    color: client.config.EmbedColors.success,
                                })
                            ]
                        })
                    });
            }
        }
    }
}