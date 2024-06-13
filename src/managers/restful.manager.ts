import { REST, Routes, ApplicationCommand } from "discord.js"
import type { ISlashCommand } from "../types/client/commands"
import type CordX from "../client/cordx"
import config from "../config/main.config"
import Logger from "../utils/logger.util"

class RestManager {
    public client: CordX
    private logger: Logger = new Logger("Rest")
    private DiscordRest = new REST({ version: config.restVersion })

    constructor(client: CordX) {
        this.client = client

        this.DiscordRest.setToken(process.env.TOKEN!)
    }

    public async getCommandID(name: string): Promise<string> {
        try {
            this.logger.info(`Getting command ID for ${name}.`)

            if (!this.client.user?.id)
                throw new Error(
                    "Client user was not resolved while getting command ID.",
                )
            const commands = (await this.DiscordRest.get(
                Routes.applicationCommands(this.client.user.id),
            )) as ApplicationCommand[]
            const command = commands.find(
                (cmd: ApplicationCommand) => cmd.name === name,
            )

            if (!command) throw new Error(`Command ${name} was not found.`)

            return command?.id
        } catch (e: unknown) {
            this.logger.error(
                `Error while getting command ID for ${name}: ${e}`,
            )
            throw e
        }
    }

    public async getPrivateCommandID(name: string): Promise<string> {
        try {
            this.logger.info(`Getting private command ID for ${name}.`)

            if (!this.client.user?.id)
                throw new Error(
                    "Client user was not resolved while getting private command ID.",
                )
            const commands = (await this.DiscordRest.get(
                Routes.applicationGuildCommands(
                    this.client.user.id,
                    "871204257649557604",
                ),
            )) as ApplicationCommand[]
            const command = commands.find(
                (cmd: ApplicationCommand) => cmd.name === name,
            )

            if (!command) throw new Error(`Command ${name} was not found.`)

            return command?.id
        } catch (e: unknown) {
            this.logger.error(
                `Error while getting private command ID for ${name}: ${e}`,
            )
            throw e
        }
    }

    /**
     * Register slash commands against the Discord API
     */
    public async registerSlashCommands(): Promise<void> {
        try {
            this.logger.info("Initializing application commands.")

            if (!this.client.user?.id)
                throw new Error(
                    "Client user was not resolved while initializing application commands.",
                )
            await this.DiscordRest.put(
                Routes.applicationCommands(this.client.user.id),
                {
                    body: this.client.commands.all.map(
                        (command: ISlashCommand) => command.props,
                    ),
                },
            )

            this.logger.ready(
                `${this.client.commands.all.size} application commands are registered!`,
            )
        } catch (e: unknown) {
            this.logger.error(`Error while registering slash commands: ${e}`)
        }
    }

    public async deleteSlashCommand(name: string): Promise<void> {
        try {
            this.logger.info("Deleting application commands.")

            if (!this.client.user?.id)
                throw new Error(
                    "Client user was not resolved while deleting application commands.",
                )
            await this.DiscordRest.delete(
                Routes.applicationCommand(this.client.user.id, name),
            )

            this.logger.ready(`Application commands are deleted!`)
        } catch (e: unknown) {
            this.logger.error(`Error while deleting slash commands: ${e}`)
        }
    }

    public async addSlashCommand(name: string): Promise<void> {
        try {
            this.logger.info(`Adding slash command "${name}".`)

            if (!this.client.user?.id)
                throw new Error(
                    "Client user was not resolved while adding application commands.",
                )
            await this.DiscordRest.post(
                Routes.applicationCommands(this.client.user.id),
                {
                    body: this.client.commands.get(name)?.props,
                },
            )

            this.logger.ready(`Slash command "${name}" was added!`)
        } catch (e: unknown) {
            this.logger.error(
                `Error while adding slash command "${name}": ${e}`,
            )
        }
    }

    public async registerPrivateCommands(): Promise<void> {
        try {
            this.logger.info("Initializing guild only commands.")

            if (!this.client.user?.id)
                throw new Error(
                    "Client user was not resolved while initializing guild only commands.",
                )
            await this.DiscordRest.put(
                Routes.applicationGuildCommands(
                    this.client.user.id,
                    "871204257649557604",
                ),
                {
                    body: this.client.private.all.map(
                        (command: ISlashCommand) => command.props,
                    ),
                },
            )

            this.logger.ready(
                `${this.client.private.all.size} guild only commands are registered!`,
            )
        } catch (e: unknown) {

            if (e instanceof Error) {
                this.logger.error(`Error while registering guild only commands: ${e.message}`);
                this.logger.debug(e.stack as string)
            }

            this.logger.error(`Error while registering guild only commands: ${e}`)
        }
    }

    public async refreshSlashCommand(name: string): Promise<void> {
        try {
            this.logger.info(`Refreshing slash command "${name}".`)

            let cmd = await this.getCommandID(name)

            this.logger.info("Command ID: " + cmd)

            if (!this.client.user?.id)
                this.logger.error(
                    "Client user was not resolved while refreshing application commands.",
                )
            else {
                await this.DiscordRest.patch(
                    Routes.applicationCommand(this.client.user.id, cmd),
                    {
                        body: this.client.commands.get(name)?.props,
                    },
                ).catch((err: Error) => {
                    this.logger.error(
                        `Error while refreshing slash command "${name}": ${err}`,
                    )
                })

                this.logger.ready(`Slash command "${name}" was refreshed!`)
            }
        } catch (e: unknown) {
            this.logger.error(
                `Error while refreshing slash command "${name}": ${e}`,
            )
        }
    }

    public async refreshPrivateCommand(name: string): Promise<void> {
        try {
            this.logger.info(`Refreshing private command "${name}".`)

            let cmd = await this.getPrivateCommandID(name)

            this.logger.info("Command ID: " + cmd)

            if (!this.client.user?.id)
                this.logger.error(
                    "Client user was not resolved while refreshing guild only commands.",
                )
            else {
                await this.DiscordRest.patch(
                    Routes.applicationGuildCommand(this.client.user.id, "871204257649557604", cmd),
                    {
                        body: this.client.private.get(name)?.props,
                    },
                )

                this.logger.ready(`Private command "${name}" was refreshed!`)
            }
        } catch (e: unknown) {
            this.logger.error(
                `Error while refreshing private command "${name}": ${e}`,
            )
        }
    }
}

export default RestManager
