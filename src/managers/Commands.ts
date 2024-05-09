import { readdirSync } from "node:fs"
import { join, sep } from "node:path"
import { ISlashCommand } from "../types/client/commands"
import { Collection } from "discord.js"
import type CordX from "../client/CordX"
import Logger from "../utils/Logger"

class CommandManager {
    public logs: Logger = new Logger("[COMMANDS]")
    public client: CordX
    public commands: Collection<string, ISlashCommand> = new Collection()

    constructor(client: CordX) {
        this.client = client
    }

    public get(name: string): ISlashCommand | undefined {
        return this.commands.get(name)
    }

    public category(category: string): Collection<string, ISlashCommand> {
        return this.commands.filter(
            (cmd: ISlashCommand) => cmd.props.category === category,
        )
    }

    public get all(): Collection<string, ISlashCommand> {
        return this.commands
    }

    public load(dir: string): void {
        readdirSync(dir).forEach(async (subDir: string): Promise<void> => {
            const commands = readdirSync(`${dir}${sep}${subDir}${sep}`)

            for (const file of commands) {
                const commandInstance = await import(join(dir, subDir, file))
                const command: ISlashCommand = new commandInstance.default()

                if (
                    command.props.name &&
                    typeof command.props.name === "string"
                ) {
                    if (this.commands.get(command.props.name))
                        return this.logs.error(
                            `${command.props.name} is already a used name`,
                        )
                    this.commands.set(command.props.name, command)
                }
            }
        })
    }
}

export default CommandManager
