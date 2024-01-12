import { REST, Routes, ApplicationCommand } from 'discord.js';
import type { ISlashCommand } from '../types/utils.interface';
import type CordX from '../client/CordX';
import config from '../config/main.config';
import Logger from '../utils/Logger';

class RestManager {
  public client: CordX;
  private logger: Logger = new Logger('Rest');
  private DiscordRest = new REST({ version: config.restVersion });

  constructor(client: CordX) {
    this.client = client;

    this.DiscordRest.setToken(process.env.TOKEN!);
  }

  public async getCommandID(name: string): Promise<string> {
    try {
      this.logger.info(`Getting command ID for ${name}.`);

      if (!this.client.user?.id) throw new Error('Client user was not resolved while getting command ID.');
      const commands = await this.DiscordRest.get(Routes.applicationCommands(this.client.user.id)) as ApplicationCommand[];
      const command = commands.find((cmd: ApplicationCommand) => cmd.name === name);

      if (!command) throw new Error(`Command ${name} was not found.`);

      return command?.id;
    } catch (e: unknown) {
      this.logger.error(`Error while getting command ID for ${name}: ${e}`);
      throw e;
    }
  }

  /**
   * Register slash commands against the Discord API
   */
  public async registerSlashCommands(): Promise<void> {
    try {
      this.logger.info('Initializing application commands.');

      if (!this.client.user?.id) throw new Error('Client user was not resolved while initializing application commands.');
      await this.DiscordRest.put(Routes.applicationCommands(this.client.user.id), {
        body: this.client.commands.all.map((command: ISlashCommand) => command.props)
      });

      this.logger.ready(`${this.client.commands.all.size} application commands are registered!`);
    } catch (e: unknown) {
      this.logger.error(`Error while registering slash commands: ${e}`);
    }
  }

  public async registerPrivateCommands(): Promise<void> {
    try {
      this.logger.info('Initializing guild only application commands.');

      if (!this.client.user?.id) throw new Error('Client user was not resolved while initializing guild only application commands.');
      await this.DiscordRest.put(Routes.applicationGuildCommands(this.client.user.id, '871204257649557604'), {
        body: this.client.private.all.map((command: ISlashCommand) => command.props)
      });

      this.logger.ready(`${this.client.private.all.size} application commands are registered!`);
    } catch (e: unknown) {
      this.logger.error(`Error while registering slash commands: ${e}`);
    }
  }

  public async refreshSlashCommand(name: string): Promise<void> {
    try {
      this.logger.info(`Refreshing slash command "${name}".`);

      let cmd = await this.getCommandID(name)

      this.logger.info('Command ID: ' + cmd)

      if (!this.client.user?.id) this.logger.error('Client user was not resolved while refreshing application commands.');

      else {
        await this.DiscordRest.patch(Routes.applicationCommand(this.client.user.id, cmd), {
          body: this.client.commands.get(name)?.props
        });

        this.logger.ready(`Slash command "${name}" was refreshed!`);
      }
    } catch (e: unknown) {
      this.logger.error(`Error while refreshing slash command "${name}": ${e}`);
    }
  }
}

export default RestManager;