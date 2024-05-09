import { readdirSync } from "node:fs"
import { join, sep } from "node:path"
import { ISlashCommand } from "../types/client/commands"
import { Collection } from "discord.js"
import type CordX from "../client/cordx"
import Logger from "../utils/logger.util"

export default class PrivateManager {
    public logs: Logger = new Logger("[PRIV COMMANDS]")
    public client: CordX
    public private: Collection<string, ISlashCommand> = new Collection()

    constructor(client: CordX) {
        this.client = client
    }

    public get(name: string): ISlashCommand | undefined {
        return this.private.get(name)
    }

    public category(category: string): Collection<string, ISlashCommand> {
        return this.private.filter(
            (cmd: ISlashCommand) => cmd.props.category === category,
        )
    }

    public get all(): Collection<string, ISlashCommand> {
        return this.private
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
                    if (this.private.get(command.props.name))
                        return this.logs.error(
                            `${command.props.name} is already a used name`,
                        )
                    this.private.set(command.props.name, command)
                }
            }
        })
    }
}
