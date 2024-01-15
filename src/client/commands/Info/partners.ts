import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import { Partner } from "../../../types/partners"
import type CordX from "../../CordX"
import axios from "axios"

export default class Partners extends SlashBase {
    constructor() {
        super({
            name: "partners",
            description: "Check the current status of one of our services.",
            usage: "/partners <subCommand>",
            example: "/partners list",
            category: "Info",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'list',
                    description: 'View a list of all our current partners!',
                    required: false,
                    type: SubCommandOptions.SubCommand,
                },
                {
                    name: 'view',
                    description: 'View more info about a specific partner!',
                    required: false,
                    options: [
                        {
                            name: 'partner',
                            description: 'Name of the partner (as seen on our website/list command)',
                            required: true,
                            type: SubCommandOptions.String
                        }
                    ],
                    type: SubCommandOptions.SubCommand
                },
                {
                    name: 'add',
                    description: 'Add a new partner to our list!',
                    required: false,
                    options: [
                        {
                            name: 'title',
                            description: 'Name of the partner',
                            required: true,
                            type: SubCommandOptions.String
                        },
                        {
                            name: 'bio',
                            description: 'Short description of the partner',
                            required: true,
                            type: SubCommandOptions.String
                        },
                        {
                            name: 'banner',
                            description: 'Banner image of the partner',
                            required: true,
                            type: SubCommandOptions.String
                        },
                        {
                            name: 'website',
                            description: 'Website of the partner',
                            required: true,
                            type: SubCommandOptions.String
                        },
                        {
                            name: 'social',
                            description: 'Social media link for0 the partner',
                            required: true,
                            type: SubCommandOptions.String
                        }
                    ],
                    type: SubCommandOptions.SubCommand
                },
                {
                    name: 'delete',
                    description: 'Delete a partner from our list!',
                    required: false,
                    options: [
                        {
                            name: 'partner',
                            description: 'Name of the partner (as seen on our website/list command)',
                            required: true,
                            type: SubCommandOptions.String
                        }
                    ],
                    type: SubCommandOptions.SubCommand
                }
            ]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        switch(interaction.options.getSubcommand()) {

            case 'list': {

                const list = await client.api.request('GET', 'partners/list');

                if (list.error) return interaction.reply({ content: 'There was an error while fetching the list of partners.', ephemeral: true });

                const fields = await list.data.map((partner: Partner) => {
                    return {
                        name: partner.title,
                        value: partner.bio,
                        inline: true
                    }
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Partners',
                            description: 'Here is a list of all our current partners, you can view more info about them using the `/partners view` command.',
                            color: client.config.EmbedColors.base,
                            fields: [...fields]
                        })
                    ]
                })
            }

            case 'view': {
                let partner = interaction.options.getString('partner');
                const partnerInfo = await client.api.request('GET', `partners/list`);
                const partnerData = partnerInfo.data.filter((p: Partner) => p.title === partner);

                if (!partnerData[0] ||
                    partnerData[0] == undefined ||
                    partnerData[0].title == undefined
                ) return interaction.reply({ content: 'That partner does not exist.', ephemeral: true });

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: partnerData[0].title,
                            image: partnerData[0].image,
                            description: partnerData[0].bio,
                            color: client.config.EmbedColors.base,
                            fields: [
                                {
                                    name: 'Website',
                                    value: `[take me there](${partnerData[0].url})`,
                                    inline: true
                                },
                                {
                                    name: 'Social Media',
                                    value: `[check it out](${partnerData[0].social})`,
                                    inline: true
                                }
                            ]
                        })
                    ]
                })
            }

            case 'add': {
                let title = interaction.options.getString('title');
                let bio = interaction.options.getString('bio');
                let banner = interaction.options.getString('banner');
                let website = interaction.options.getString('website');
                let social = interaction.options.getString('social');

                /**
                 * ALLOW CORDX DEVS TO USE THE COMMAND!
                 */
                if (!client.perms.doesUserHaveRole(interaction?.guild?.id as string, interaction.user.id as string, '871275407134040064')) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: Missing Permissions',
                            description: 'You do not have permission to use this command.',
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                const urlencoded = new URLSearchParams();
                urlencoded.append("Authorization", process.env.API_SECRET as string);
                urlencoded.append("title", title as string);
                urlencoded.append("image", banner as string);
                urlencoded.append("bio", bio as string);
                urlencoded.append("url", website as string);
                urlencoded.append("social", social as string);
                urlencoded.append("Method", "add");

                await axios.post(`${client.config.API.domain}partners/manage`,
                urlencoded, {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'cache-control': 'no-cache'
                    }
                }).then((res) => {
                    if (res.status === 200) return interaction.reply({
                        embeds: [
                            new client.Embeds({
                                title: 'Partner Added',
                                description: `${title} has been added to our partners!`,
                                color: client.config.EmbedColors.success,
                                fields: [
                                    {
                                        name: 'Description',
                                        value: `${bio}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Banner',
                                        value: `${banner}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Website',
                                        value: `${website}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Social Media',
                                        value: `${social}`,
                                        inline: true
                                    }
                                ]
                            })
                        ]
                    })
                }).catch(async (e: any) => {

                        await client.logs.error(`Error while trying to add a partner to our list with error: ${e.stack}`)
                        
                        return interaction.reply({
                            embeds: [
                                new client.Embeds({
                                    title: 'Error: request failed!',
                                    description: 'Whoops, something went wrong see below for details.',
                                    color: client.config.EmbedColors.error,
                                    fields: [
                                        {
                                            name: 'Code',
                                            value: `\`\`\`${e.response.data.code}\`\`\``,
                                            inline: false
                                        },
                                        {
                                            name: 'Message',
                                            value: `\`\`\`${e.response.data.message}\`\`\``,
                                            inline: false
                                        },
                                        {
                                            name: 'Solutions',
                                            value: `\`\`\`${e.response.data.errormsg}\`\`\``,
                                            inline: false
                                        },
                                        {
                                            name: 'Status',
                                            value: `\`\`\`${e.response.data.status}\`\`\``,
                                            inline: false
                                        }
                                    ]
                                })
                            ]
                        })
                })
            }

            break;

            case 'delete': {
                let name = interaction.options.getString('partner');

                /**
                 * ALLOW CORDX DEVS TO USE THE COMMAND!
                 */
                if (!client.perms.doesUserHaveRole(interaction?.guild?.id as string, interaction.user.id as string, '871275407134040064')) return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: Missing Permissions',
                            description: 'You do not have permission to use this command.',
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                const urlencoded = new URLSearchParams();
                urlencoded.append("Authorization", process.env.API_SECRET as string);
                urlencoded.append("title", name as string);
                urlencoded.append("Method", "delete");

                await axios.post(`${client.config.API.domain}partners/manage`,
                urlencoded, {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'cache-control': 'no-cache'
                    }
                }).then((res) => {
                    if (res.status === 200) return interaction.reply({
                        embeds: [
                            new client.Embeds({
                                title: 'Partner Deleted',
                                description: `${name} has been deleted from our partners!`,
                                color: client.config.EmbedColors.success
                            })
                        ]
                    })
                }).catch(async (e: any) => {
                        
                            await client.logs.error(`Error while trying to delete a partner from our list with error: ${e.stack}`)
                            
                            return interaction.reply({
                                embeds: [
                                    new client.Embeds({
                                        title: 'Error: request failed!',
                                        description: 'Whoops, something went wrong see below for details.',
                                        color: client.config.EmbedColors.error,
                                        fields: [
                                            {
                                                name: 'Code',
                                                value: `\`\`\`${e.response.data.code}\`\`\``,
                                                inline: false
                                            },
                                            {
                                                name: 'Message',
                                                value: `\`\`\`${e.response.data.message}\`\`\``,
                                                inline: false
                                            },
                                            {
                                                name: 'Solutions',
                                                value: `\`\`\`${e.response.data.errormsg}\`\`\``,
                                                inline: false
                                            },
                                            {
                                                name: 'Status',
                                                value: `\`\`\`${e.response.data.status}\`\`\``,
                                                inline: false
                                            }
                                        ]
                                    })
                                ]
                            })
                })
            }

            break;

            case 'default': {
                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Error: Invalid Subcommand',
                            description: 'Please use the command correctly.',
                            color: client.config.EmbedColors.error,
                            fields: [
                                {
                                    name: 'Usage',
                                    value: `\`\`\`${this.props.usage}\`\`\``
                                },
                                {
                                    name: 'Example',
                                    value: `\`\`\`${this.props.example}\`\`\``
                                }
                            ]
                        })
                    ]
                })
            }
        }
    }
}