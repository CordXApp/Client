import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities";
import { AllowedProviders } from "../../../../types/modules/orgs";
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"
import Filter from "bad-words";

export default class Uploads extends SlashBase {
    constructor() {
        super({
            name: "org",
            description: "Create or delete an organization!",
            usage: "/org <SubCommand> <Params>",
            example: "/org help",
            category: "Orgs",
            cooldown: 5,
            permissions: {
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'help',
                description: 'Get help with the org command!',
                example: 'help',
                type: SubCommandOptions.SubCommand,
                required: false
            }, {
                name: 'create',
                example: 'create "name" "description" "logo" "banner"',
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
                example: 'view "id"',
                description: 'View an organization',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'id',
                    description: 'The ID of the organization',
                    type: SubCommandOptions.String,
                    required: true
                }]
            }, {
                name: 'list',
                example: 'list',
                description: 'List a users organizations',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'user',
                    description: 'The user to list organizations for',
                    type: SubCommandOptions.User,
                    required: false
                }]
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch (interaction.options.getSubcommand()) {

            case 'help': {

                const subCommands = await this?.props?.options?.map((option) => {
                    return `- \`${option?.example}\` - ${option?.description}`
                });

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Orgs: help menu',
                            description: 'Below are the available org commands and their usage',
                            color: client.config.EmbedColors.base,
                            fields: [{
                                name: 'Usage',
                                value: `\`${this?.props?.usage}\``,
                                inline: true
                            }, {
                                name: 'Example',
                                value: `\`${this?.props?.example}\``,
                                inline: true
                            }, {
                                name: 'Cooldown',
                                value: `\`${this?.props?.cooldown} seconds\``,
                                inline: true
                            }, {
                                name: 'Subcommands',
                                value: subCommands?.join('\n'),
                                inline: false
                            }]
                        })
                    ]
                })
            }

            case 'create': {

                const name = interaction.options.getString('name', true);
                const description = interaction.options.getString('description', true);
                const logo = interaction.options.getString('logo', true);
                const banner = interaction.options.getString('banner', true);

                const filter = new Filter();

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

                if (filter.isProfane(description)) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid description',
                            description: 'The description of the organization contains inappropriate language',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                const repeatedCharacter = /(.)\1{4,}/;
                if (repeatedCharacter.test(description)) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid description',
                            description: 'The description of the organization contains repeated characters',
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                const nonAlphanumericCharacters = /[^a-z0-9\s]/gi;
                const nonAlphanumericCount = (description.match(nonAlphanumericCharacters) || []).length;

                if (nonAlphanumericCount > description.length * 0.2) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: invalid description',
                            description: 'The description of the organization contains too many non-alphanumeric characters',
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

                if (!AllowedProviders.some(provider => logo.includes(provider)) ||
                    !AllowedProviders.some(provider => banner.includes(provider))) {
                    return interaction.reply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: invalid provider',
                                description: `The provider of the logo and/or banner should be one of the following: \`${AllowedProviders.join(', ')}\``,
                                color: client.config.EmbedColors.error,
                            })
                        ]
                    });
                }

                const cornflake = client.db.cornflake.generate();

                const create = await client.db.entity.create({
                    entity: 'Organization',
                    org: {
                        id: cornflake,
                        name: name,
                        logo: logo,
                        banner: banner,
                        description: description,
                        owner: interaction.user.id,
                        webhook: 'none',
                        domain: 'none'
                    }
                });

                if (!create.success) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: failed to create org',
                            description: create.message,
                            color: client.config.EmbedColors.error,
                        })
                    ]
                });

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Success: org created',
                            description: 'Note: this is just the basic info, you can add and control more via our [website](https://cordximg.host)!',
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
                const id = interaction.options.getString('id', false);

                const view = await client.db.entity.fetch({
                    entity: 'Organization',
                    entityId: id as string
                })

                if (!view.success) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: failed to fetch org',
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
                            color: client.config.EmbedColors.base,
                            thumbnail: view.data.logo,
                            description: view.data.description,
                            hideTimestamp: true,
                            fields: [{
                                name: 'ID',
                                value: view.data.id,
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
                                value: `${view.data.domain !== 'none' ? view.data.domain.name : 'No domain available!'}`,
                                inline: true
                            }, {
                                name: 'Flags',
                                value: `- <:partner:1247467408399274037> Partner: ${partner}\n- <:verified:1247467391856803860> Verified: ${verified}\n- <:banned:1247467378644881409> Banned: ${banned}`,
                                inline: true
                            }],
                            footer: `Created: ${formatAMPM(created)} | Updated: ${formatAMPM(updated)}`
                        })
                    ]
                })
            }

            case 'list': {
                const user = interaction.options.getUser('user', false) || interaction.user;

                const orgs = await client.db.user.model.listOrgs(user.id);

                if (!orgs.success) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: failed to fetch orgs',
                            description: `${orgs.message}`,
                            color: client.config.EmbedColors.error
                        })
                    ]
                });

                const fields = orgs.data.map((org) => {
                    let name: string;

                    if (org.banned) name = `<:banned:1247467378644881409> ${org.name}`
                    else if (org.verified) name = `<:verified:1247467391856803860> ${org.name}`
                    else if (org.partner) name = `<:partner:1247467408399274037> ${org.name}`
                    else name = org.name

                    return {
                        name: name,
                        value: `ID: ${org.id}`,
                        inline: true
                    }
                })

                return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: `Organizations for: ${user.globalName}`,
                            description: 'Here is all the users organizations :eyes:',
                            color: client.config.EmbedColors.success,
                            fields: [...fields]
                        })
                    ]
                })
            }
        }
    }
}