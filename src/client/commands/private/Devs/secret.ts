const { pagination, ButtonTypes, ButtonStyles } = require("@devraelfreeze/discordjs-pagination")
import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import type { Entities } from "../../../../types/database/secrets";
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
                    options: [{
                        name: 'entity',
                        description: 'The entity to create a secret for',
                        type: SubCommandOptions.String,
                        required: true
                    }, {
                        name: 'uses',
                        description: 'Amount of times the secret can be used per day',
                        type: SubCommandOptions.Number,
                        required: true
                    }, {
                        name: 'user',
                        description: 'The user to create a secret for (if entity is User)',
                        type: SubCommandOptions.User,
                        required: false
                    }, {
                        name: 'org',
                        description: 'The org to create a secret for (if entity is Organization)',
                        type: SubCommandOptions.String,
                        required: false
                    }]
                },
                {
                    name: "list",
                    description: "List all of the API Secrets in the database",
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

                const entity = interaction.options.getString('entity', true);
                const maxUses = interaction.options.getNumber('maxUses', true);
                const user = interaction.options.getUser('user', false);
                const org = interaction.options.getString('org', false);

                let res: Entities;

                if (entity === 'User') res = 'User';
                else if (entity === 'Organization') res = 'Organization';
                else res = 'Admin';

                if (res === 'User' && !user) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: missing user',
                            description: `You need to provide a user to create a secret for!`,
                            color: client.config.EmbedColors.error
                        })
                    ]
                });

                if (res === 'Organization' && !org) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: missing organization',
                            description: `You need to provide an organization to create a secret for!`,
                            color: client.config.EmbedColors.error
                        })
                    ]
                });

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

                return Promise.all([client.utils.base.delay(5000), client.db.secret.model.create({
                    entity: res,
                    maxUses: maxUses,
                    entityId: res === 'Organization' && org !== null ? org : user?.id as string
                })])
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

                        await interaction.user.createDM(true).then(async (dm) => {
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
                                        }, {
                                            name: 'Encrypted Key',
                                            value: `${res.data.encrypted}`,
                                            inline: false
                                        }, {
                                            name: 'Decrypted Key',
                                            value: `${res.data.decrypted}`,
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

            case 'list': {

                await interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Action: list secrets',
                            description: `Please wait while i fetch all the secrets!`,
                            thumbnail: client.config.Icons.loading,
                            color: client.config.EmbedColors.warning
                        })
                    ]
                })

                return Promise.all([client.utils.base.delay(5000), client.db.secret.model.list()])
                    .then(async ([_, res]) => {

                        let relation;

                        if (!res.success) return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: "Error: failed to fetch",
                                    description: `${res.message}`,
                                    color: client.config.EmbedColors.error,
                                })
                            ]
                        })

                        const secrets = res.data.map((secret: any) => {

                            if (secret.entity === 'User') relation = `${secret.userId}`;
                            else if (secret.entity = 'Organization') relation = `${secret.orgId}`;
                            else relation = 'No active relation'

                            return new client.EmbedBuilder({
                                title: `ID: ${secret.id}`,
                                description: 'Here is some basic info for this secret.',
                                color: client.config.EmbedColors.base,
                                fields: [{
                                    name: 'Entity',
                                    value: `${secret.entity}`,
                                    inline: true
                                }, {
                                    name: 'Secret',
                                    value: `**${secret.key.replace(secret.key, 'REDACTED')}**`,
                                    inline: true
                                }, {
                                    name: 'Total Uses',
                                    value: `${secret.uses}`,
                                    inline: true
                                }, {
                                    name: 'Max Uses',
                                    value: `${secret.maxUses}`,
                                    inline: true
                                }, {
                                    name: 'Restricted',
                                    value: `${secret.limited}`,
                                    inline: true
                                }, {
                                    name: 'Relation',
                                    value: `${relation}`,
                                    inline: true
                                }, {
                                    name: 'Created',
                                    value: `${secret.createdAt}`,
                                    inline: true
                                }, {
                                    name: 'Updated',
                                    value: `${secret.updatedAt}`,
                                    inline: true
                                }]
                            })
                        })

                        return pagination({
                            interaction: interaction,
                            embeds: [...secrets],
                            author: interaction.user,
                            disableButtons: true,
                            fastSkip: true,
                            ephemeral: false,
                            time: 60000,
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
                            }],
                            max: 500
                        })


                    }).catch((err: Error) => {
                        client.logs.error(`Error listing secrets: ${err.message}`);
                        client.logs.debug(err.stack as string);

                        return interaction.editReply({
                            embeds: [
                                new client.EmbedBuilder({
                                    title: 'Error: failed to fetch secrets',
                                    description: "```json\n" + err.stack + "\n```",
                                    color: client.config.EmbedColors.error,
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

                return Promise.all([client.utils.base.delay(5000), client.db.secret.model.view(secretId)])
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

                        await interaction.user.createDM(true).then(async (dm) => {
                            await dm.send({
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'View: api secret',
                                        description: 'Please do not share or abuse this secret.',
                                        color: client.config.EmbedColors.success,
                                        fields: [{
                                            name: 'Secret',
                                            value: `${res.data.secret}`,
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