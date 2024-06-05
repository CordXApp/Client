import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"

export default class Uploads extends SlashBase {
    constructor() {
        super({
            name: "org",
            description: "Create or delete an organization!",
            usage: "/org <SubCommand> <Params>",
            example: "/org create",
            category: "Orgs",
            cooldown: 5,
            permissions: {
                gate: ['OWNER', 'DEVELOPER'],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'create',
                description: 'Create an organization!',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'name',
                    description: 'The name of the organization',
                    type: SubCommandOptions.String,
                    required: true
                }, {
                    name: 'description',
                    description: 'The description of the organization',
                    type: SubCommandOptions.String,
                    required: true
                }, {
                    name: 'logo',
                    description: 'The logo of the organization',
                    type: SubCommandOptions.String,
                    required: true
                }, {
                    name: 'banner',
                    description: 'The banner of the organization',
                    type: SubCommandOptions.String,
                    required: true
                }]
            }, {
                name: 'view',
                description: 'View an organization',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'id',
                    description: 'The ID of the organization',
                    type: SubCommandOptions.String,
                    required: true
                }]
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'create': {

                const name = interaction.options.getString('name', true);
                const description = interaction.options.getString('description', true);
                const logo = interaction.options.getString('logo', true);
                const banner = interaction.options.getString('banner', true);

                if (name.length > 100) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid name lenght',
                            description: 'The name of the organization must be less than 100 characters',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                if (description.length > 200) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid description lenght',
                            description: 'The description of the organization must be less than 200 characters',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                if (description.length < 100) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid description lenght',
                            description: 'The description of the organization must be more than 100 characters',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                if (!logo.endsWith('.png') && !logo.endsWith('.jpg') && !logo.endsWith('.jpeg')) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid logo format',
                            description: 'The logo of the organization must be a link to a png, jpg, or jpeg file',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                if (!banner.endsWith('.png') && !banner.endsWith('.jpg') && !banner.endsWith('.jpeg')) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid banner format',
                            description: 'The banner of the organization must be a link to a png, jpg, or jpeg file',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                const create = await client.modules.orgs.organization.create({
                    name,
                    description,
                    logo,
                    banner,
                    owner: interaction.user.id
                });

                if (!create.success) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error creating organization',
                            description: create.message,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Organization created',
                            description: 'Your organization has been created successfully!',
                            thumbnail: create.data.logo,
                            color: client.config.EmbedColors.success,
                            fields: [{
                                name: 'ID',
                                value: `${create.data.id}`,
                                inline: true
                            }, {
                                name: 'Name',
                                value: `${create.data.name}`,
                                inline: true
                            }, {
                                name: 'Owner',
                                value: `<@${create.data.owner}>`,
                                inline: true
                            }]
                        })
                    ]
                });
            }

            case 'view': {
                const id = interaction.options.getString('id', true);

                const view = await client.modules.orgs.organization.view(id);

                if (!view.success) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error fetching organization',
                            description: view.message,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                const verified = view.data.verified ? 'yes' : 'no';
                const banned = view.data.banned ? 'yes' : 'no';
                const partner = view.data.partner ? 'yes' : 'no';

                let name: string;

                if (view.data.banned) name = `<:banned:1247467378644881409> ${view.data.name}`
                else if (view.data.verified) name = `<:verified:1247467391856803860> ${view.data.name}`
                else if (view.data.partner) name = `<:partner:1247467408399274037> ${view.data.name}`
                else name = view.data.name

                const created = new Date(view.data.createdAt);
                const updated = new Date(view.data.updatedAt);

                const formatAMPM = (date) => {
                    let hours = date.getHours();
                    let minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';

                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    return hours + ':' + minutes + ' ' + ampm;
                }

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: `${name}`,
                            color: client.config.EmbedColors.success,
                            thumbnail: view.data.logo,
                            description: `${view.data.description}`,
                            hideTimestamp: true,
                            fields: [{
                                name: 'ID',
                                value: `${view.data.id}`,
                                inline: true
                            }, {
                                name: 'Owner',
                                value: `<@${view.data.owner}>`,
                                inline: true
                            }, {
                                name: 'Members',
                                value: `${view.data.members.length > 0 ? view.data.members.length + 'Total Members' : 'No org members available!'}`,
                                inline: true
                            }, {
                                name: 'Links',
                                value: `${view.data.links ? view.data.links : 'No links available!'}`,
                                inline: true
                            }, {
                                name: 'Domain',
                                value: `${view.data.domain ? view.data.domain.name : 'No domain available!'}`,
                                inline: true
                            }, {
                                name: 'Flags',
                                value: `- <:partner:1247467408399274037> Partner: ${partner}\n- <:verified:1247467391856803860> Verified: ${verified}\n- <:banned:1247467378644881409> Banned: ${banned}`,
                                inline: true
                            }],
                            footer: `Created: ${formatAMPM(created)} | Updated: ${formatAMPM(updated)}`
                        })
                    ]
                });
            }
        }
    }
}