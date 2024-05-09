import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/Command.schema";
import { Report } from "../../../../types/database/reports";
import { reports } from "@prisma/client";
import type CordX from "../../../CordX";

export default class ReportCmd extends SlashBase {
    constructor() {
        super({
            name: 'report',
            description: 'Create, view or update a report!',
            category: 'Users',
            cooldown: 5,
            permissions: {
                base: {
                    user: ['SendMessages', 'EmbedLinks'],
                    client: ['SendMessages', 'EmbedLinks']
                }
            },
            options: [{
                name: 'create',
                description: 'Create a new report',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'type',
                    description: 'The type of report you want to create',
                    type: SubCommandOptions.String,
                    required: true,
                    choices: [{
                        name: 'Bug Report',
                        value: 'BUG_REPORT'
                    }, {
                        name: 'Feature Request',
                        value: 'FEATURE_REQUEST'
                    }, {
                        name: 'Partner Request',
                        value: 'PARTNER_REQUEST'
                    }, {
                        name: 'Partner Report',
                        value: 'PARTNER_REPORT'
                    }, {
                        name: 'User Report',
                        value: 'USER_REPORT'
                    }, {
                        name: 'Image Report',
                        value: 'IMAGE_REPORT'
                    }, {
                        name: 'Domain Report',
                        value: 'DOMAIN_REPORT'
                    }, {
                        name: 'Webhook Report',
                        value: 'WEBHOOK_REPORT'
                    }]
                }, {
                    name: 'reason',
                    description: 'Reason for the report/Report message.',
                    type: SubCommandOptions.String,
                    required: true
                }]
            }, {
                name: 'view',
                description: 'View a report via its ID',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'id',
                    description: 'The ID of the report you want to view',
                    type: SubCommandOptions.String,
                    required: true
                }]
            }, {
                name: 'list',
                description: 'List all reports for yourself or a specified user',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'user_id',
                    description: 'The ID of the user you want to view reports for',
                    type: SubCommandOptions.String,
                    required: false
                }]
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'create': {

                const type = interaction.options.getString('type', true);
                const reason = interaction.options.getString('reason', true);

                if (reason.length > 1024) return interaction.reply({
                    content: 'The reason for the report cannot be more than 1024 characters!',
                    ephemeral: true
                })

                const report = await client.db.report.create({
                    type: type as reports['type'],
                    reason: reason as string,
                    author: interaction.user.id as string
                })

                if (!report.success) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: report creation failed!',
                            description: report.message,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                })

                await interaction.user.createDM(true).then(async (dm) => {
                    await dm.send({
                        embeds: [
                            new client.Embeds({
                                title: 'Report Created!',
                                description: 'Your report has been successfully created!',
                                color: client.config.EmbedColors.success,
                                fields: [{
                                    name: 'ID',
                                    value: `\`${report.data.id}\``,
                                    inline: false
                                }, {
                                    name: 'Type',
                                    value: `\`${report.data.type}\``,
                                    inline: false
                                }, {
                                    name: 'Status',
                                    value: `\`${report.data.status}\``,
                                    inline: false
                                }, {
                                    name: 'Created',
                                    value: `\`${new Date(report.data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\``,
                                    inline: false
                                }, {
                                    name: 'Note',
                                    value: `- You will be notified of any changes to your report (hopefully).\n- You will need the ID above to view the report.\n- You can view the report using my: \`/report view\` command.`,
                                    inline: false
                                }]
                            })
                        ]
                    })
                })

                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.Embeds({
                            title: 'Success: report created!',
                            description: 'Your report has been created successfully, i have sent more information to your DM\'s',
                            color: client.config.EmbedColors.success,
                        })
                    ]
                })
            }

            case 'view': {

                const id = interaction.options.getString('id', true);

                const report = await client.db.report.fetch(id, interaction.user.id);

                if (!report.success) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: failed to fetch report!',
                            description: report.message,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                })

                const author = await client.users.fetch(report.data.author);

                if (report.data.mod) {

                    const mod = await client.users.fetch(report.data.mod);

                    return interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new client.Embeds({
                                title: `Report: ${report.data.id}`,
                                description: 'Here is what you need to know about the requested report!',
                                color: client.config.EmbedColors.base,
                                fields: [{
                                    name: 'Type',
                                    value: `\`${report.data.type}\``,
                                    inline: true
                                }, {
                                    name: 'Status',
                                    value: `\`${report.data.status}\``,
                                    inline: true
                                }, {
                                    name: 'Author',
                                    value: `${author.globalName}`,
                                    inline: true
                                }, {
                                    name: 'Moderator',
                                    value: `${mod.globalName}`,
                                    inline: true
                                }, {
                                    name: 'Created',
                                    value: `\`${new Date(report.data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\``,
                                    inline: true
                                }, {
                                    name: 'Updated',
                                    value: `\`${new Date(report.data.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\``,
                                    inline: true
                                }, {
                                    name: 'Reason',
                                    value: `\`${report.data.reason}\``,
                                    inline: false
                                }]
                            })
                        ]
                    })
                }

                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.Embeds({
                            title: `Report: ${report.data.id}`,
                            description: 'Here is what you need to know about the requested report!',
                            color: client.config.EmbedColors.base,
                            fields: [{
                                name: 'Type',
                                value: `\`${report.data.type}\``,
                                inline: true
                            }, {
                                name: 'Status',
                                value: `\`${report.data.status}\``,
                                inline: true
                            }, {
                                name: 'Author',
                                value: `${author.globalName}`,
                                inline: true
                            }, {
                                name: 'Moderator',
                                value: 'No moderator assigned yet!',
                                inline: true
                            }, {
                                name: 'Created',
                                value: `\`${new Date(report.data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\``,
                                inline: true
                            }, {
                                name: 'Updated',
                                value: `\`${new Date(report.data.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\``,
                                inline: true
                            }, {
                                name: 'Reason',
                                value: `\`${report.data.reason}\``,
                                inline: false
                            }]
                        })
                    ]
                })
            }

            case 'list': {

                const user = interaction.options.getString('user_id', false) || interaction.user.id;

                const reports = await client.db.report.list(user);

                if (!reports.success) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: failed to fetch reports!',
                            description: reports.message,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Reports List',
                            description: 'Here is a list of all the reports you have created!',
                            color: client.config.EmbedColors.base,
                            fields: reports.data.map((report: Report) => {
                                return {
                                    name: `ID: ${report.id}`,
                                    value: `Type: \`${report.type}\`\nStatus: \`${report.status}\`\nMod: \`${report.mod ? report.mod : 'unassigned'}\`\nCreated: \`${new Date(report.createdAt as Date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\`\nUpdated: \`${new Date(report.updatedAt as Date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\``,
                                    inline: false
                                }
                            })
                        })
                    ]
                })
            }
        }
    }
}