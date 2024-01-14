import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import { Partner } from "../../../types/partners"
import type CordX from "../../CordX"

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
                            description: partnerData[0].bio,
                            thumbnail: partnerData[0].image,
                            color: client.config.EmbedColors.base,
                            fields: [
                                {
                                    name: 'Website',
                                    value: partnerData[0].website,
                                    inline: true
                                },
                                {
                                    name: 'Social Media',
                                    value: partnerData[0].social,
                                    inline: true
                                }
                            ]
                        })
                    ]
                })
            }

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