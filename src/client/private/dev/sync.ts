import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { SubCommandOptions } from '../../../types/base.interface';
import { SlashBase } from '../../../schemas/Command.schema';
import type CordX from '../../../client/CordX';
import config from '../../../config/main.config';

export default class Sync extends SlashBase {
  constructor() {
    super({
      name: 'sync',
      description: 'Refresh/reload a slash command',
      category: 'Developers',
      cooldown: 5,
      ownerOnly: true,
      userPermissions: [],
      clientPermissions: [],
      options: [
        {
          name: 'command',
          description: 'The command to refresh',
          required: true,
          type: SubCommandOptions.String
        }
      ]
    });
  }

  public async execute(client: CordX, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

    const cmd = await interaction.options.getString('command');

    if (!client.commands.get(cmd as string)) return interaction.reply({
        ephemeral: false,
        embeds: [
            new client.Embeds({
            title: 'Error: Invalid Command',
            description: 'The command you provided is invalid. Please try again.',
            color: client.config.EmbedColors.error
            })
        ]
    })

    try {

      await interaction.reply({
        embeds: [
          new client.Embeds({
            title: 'Refreshing Command',
            description: `I\'m refreshing that command for you, please wait...`,
            color: client.config.EmbedColors.base,
            thumbnail: client.config.Icons.loading,
            fields: [
              {
                name: 'Command Name',
                value: `\`${cmd}\``,
                inline: true
              }
            ]
          })
        ]
      })

      setTimeout(async() => {

        await client.restApi.refreshSlashCommand(cmd as string);
        
        await interaction.editReply({
            embeds: [
                new client.Embeds({
                    title: 'Success',
                    description: `Command has been refreshed`,
                    color: client.config.EmbedColors.success,
                    fields: [
                      {
                        name: 'Command Name',
                        value: `\`${cmd}\``,
                        inline: true
                      }
                    ]
                })
            ]
        })

        setTimeout(async() => {
            await interaction.deleteReply();
        }, 2500)

      }, 5000)

        
    } catch (e: any) {

        await client.logs.error(`Error while refreshing command: ${e.stack}`);

        return interaction.reply({
            ephemeral: false,
            embeds: [
                new client.Embeds({
                    title: 'Error',
                    description: `There was an error while refreshing the command \`${cmd}\`. Please try again.`,
                    color: client.config.EmbedColors.error
                })
            ]
        })
    }
  }
}