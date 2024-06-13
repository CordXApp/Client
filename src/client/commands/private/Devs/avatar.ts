import { type CacheType, type ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../../types/client/utilities"
import { SlashBase } from "../../../../schemas/command.schema";
import type CordX from "../../../cordx"

export default class aSync extends SlashBase {
    constructor() {
        super({
            name: "avatar",
            description: "Update the bots avatar.",
            category: "Developers",
            cooldown: 5,
            permissions: {
                gate: ['OWNER'],
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'avatar',
                description: 'The avatar you want to use.',
                type: SubCommandOptions.Attachment,
                required: true
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        const avatar = interaction.options.getAttachment('avatar', true);

        await interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: 'Action: update avatar',
                    description: 'Please wait while i update my avatar for you!',
                    thumbnail: client.config.Icons.loading,
                    color: client.config.EmbedColors.warning
                })
            ]
        });

        return Promise.all([client.utils.base.delay(10000), client.user?.setAvatar(avatar.url)]).then(async ([, res]) => {

            if (!res) return interaction.editReply({
                embeds: [
                    new client.EmbedBuilder({
                        title: 'Error: unknown error',
                        description: 'Something ain\'t right here chief!',
                        color: client.config.EmbedColors.error
                    })
                ]
            })

            return interaction.editReply({
                embeds: [
                    new client.EmbedBuilder({
                        title: 'Success: avatar updated',
                        description: 'I have updated my avatar for you!',
                        color: client.config.EmbedColors.success
                    })
                ]
            });
        }).catch((err: Error) => {
            return interaction.editReply({
                embeds: [
                    new client.EmbedBuilder({
                        title: 'Error: update failed',
                        description: err.message as string,
                        color: client.config.EmbedColors.error
                    })
                ]
            })
        })
    }
}
