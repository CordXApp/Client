import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema"
import type CordX from "../../../cordx"
import axios from "axios";

export default class Uploads extends SlashBase {
    constructor() {
        super({
            name: "upload",
            description: "Manage your uploads",
            usage: "/upload <SubCommand> <Params>",
            example: "/upload delete fileId.png",
            category: "Sharex",
            cooldown: 5,
            permissions: {
                gate: [],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'create',
                description: 'Upload a file to our servers!',
                type: SubCommandOptions.SubCommand,
            }, {
                name: 'delete',
                description: 'Delete a file from our servers!',
                type: SubCommandOptions.SubCommand,
                options: [{
                    name: 'fileid',
                    description: 'The id of the file you want to delete!',
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
                return interaction.reply({
                    content: 'This feature is coming soon! Please check back later!',
                    ephemeral: true
                })
            }

            case 'delete': {
                const fileId = interaction.options.getString('fileid') as string;

                if (!fileId.includes('.')) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Invalid File ID',
                            description: 'Whoops, the File ID you provided is invalid, you can find the fileId in the url you use to share it (example: `cordx.lol/users/1234/fileId.png`)',
                            color: client.config.EmbedColors.error,
                            fields: [{
                                name: 'Note:',
                                value: `The File ID should also include a file extension like .png, .jpg, .gif, etc.`,
                                inline: false
                            }]
                        })
                    ]
                })

                const user = await client.db.user.model.fetch(interaction.user.id);
                const file = await client.db.prisma.uploads.findFirst({ where: { id: fileId, userid: interaction.user.id } });

                if (!user) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'User Not Found',
                            description: 'Whoops, looks like you are not registered in your system, you should log into our website',
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                if (!file) return interaction.reply({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'File Not Found',
                            description: 'Whoops, slow down there chief, the file you are trying to delete either doesn\'t exist or it doesn\'t belong to you!',
                            color: client.config.EmbedColors.error
                        })
                    ]
                })

                const env = client.user!.id === '829979197912645652' ? 'dev' : 'prod'
                const url = env === 'dev' ? `http://localhost:4985/upload/delete` : `${client.config.API.domain}/upload/delete`;

                return await axios.delete(url, {
                    headers: { secret: user.data.secret },
                    data: {
                        userid: interaction.user.id,
                        fileid: fileId
                    }
                }).then(() => {
                    return interaction.reply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'File Deleted',
                                description: 'The file has been successfully deleted from our servers!',
                                color: client.config.EmbedColors.success
                            })
                        ]
                    })
                }).catch((err) => {
                    return interaction.reply({
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'An Error Occurred',
                                description: 'Whoops, an error occurred while trying to delete the file, please try again later!',
                                color: client.config.EmbedColors.error,
                                fields: [{
                                    name: 'Error:',
                                    value: `\`\`\`js\n${err.response.data.message}\`\`\``,
                                    inline: false
                                }]
                            })
                        ]
                    })
                });
            }

            default: {
                return interaction.reply({
                    content: 'Invalid SubCommand provided!',
                    ephemeral: true
                })
            }
        }
    }
}