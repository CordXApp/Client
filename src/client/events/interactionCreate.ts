import { Collection, ApplicationCommandOptionType } from 'discord.js';
import type { CacheType, Interaction } from 'discord.js';
import EventBase from '../../schemas/Event.schema';
import type CordX from '../../client/CordX';

export default class InteractionCreate extends EventBase {
  constructor() {
    super({ name: 'interactionCreate' });
  }

  public execute(client: CordX, interaction: Interaction<CacheType>): any {
    if (interaction.isCommand()) {
    
      const cmd = client.commands.get(interaction.commandName);

      if (!cmd) return;

      if (cmd.props.ownerOnly && interaction.member?.user.id !== '510065483693817867') return;

      if (cmd.props.cooldown) {
        if (!client.cooldown.has(cmd.props.name)) {
          client.cooldown.set(cmd.props.name, new Collection());
        }

        const now = Date.now();

        const timestamps = client.cooldown.get(cmd.props.name);
        const cooldownAmount = cmd.props.cooldown * 1000;

        if (timestamps?.has(interaction.user.id)) {
          const cooldown = timestamps.get(interaction.user.id);

          if(cooldown) {
            const expirationTime = cooldown + cooldownAmount;

            if (now < expirationTime) {
              const timeLeft = (expirationTime - now) / 1000;
              return interaction.reply({ content: `Whoops, you are using that command to fast. Please wait ${timeLeft} seconds before you try again!`, ephemeral: true });
            }
          }
        }

        timestamps?.set(interaction.user.id, now);
        setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
      }

      const args: any = [];

      for (let option of interaction.options.data) {
        if (option.type === ApplicationCommandOptionType.Subcommand) {
          if (option.name) args.push(option.name);
          option.options?.forEach((x: any) => {
            if (x.value) args.push(x.value);
          });
        } else if (option.value) args.push(option.value);
      }

      try {

        cmd.execute(client, interaction, args)

      } catch (err: any) {
        client.logs.error(`Error while executing command ${cmd.props.name}: ${err.stack}`);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
}