import { join } from "node:path"
import Config from "../config/main.config"
import { CordxEmbed } from "../utils/Embeds"
import { HelperUtilities } from "../utils/Helper"
import { DatabaseManager } from "../managers/Database"
import { PermissionsManager } from "../managers/Permissions"
import { Client, ClientOptions, Collection } from "discord.js"
import type { IConfig } from "../types/client"
import PrivateManager from "../managers/Private"
import CommandManager from "../managers/Commands"
import EventManager from "../managers/Listeners"
import RestManager from "../managers/Restful"
import { API } from "../managers/API"
import Logger from "../utils/Logger"

class CordX extends Client {
    public logs: Logger = new Logger("Client")
    public db: DatabaseManager = new DatabaseManager(this, process.env.DB_URI as string)
    public perms: PermissionsManager = new PermissionsManager(this)
    public cooldown = new Collection<string, Collection<string, number>>()
    public private: PrivateManager = new PrivateManager(this)
    public commands: CommandManager = new CommandManager(this)
    public events: EventManager = new EventManager(this)
    public restApi: RestManager = new RestManager(this)
    public api: API = new API(this)
    public Embeds: any = CordxEmbed
    public utils: any = HelperUtilities
    public config: IConfig = Config

    constructor(options: ClientOptions) {
        super(options)
        this.init()
    }

    public async authenticate(token: string): Promise<void> {
        try {
            this.logs.info(
                `Initializing client with token: ${token.substring(0, 5)}.****`,
            )
            await this.login(token)
        } catch (e: any) {
            this.logs.error(`Error initializing client: ${e.stack}`)
        }
    }

    private init(): void {
        this.private.load(join(__dirname, "./private/"))
        this.commands.load(join(__dirname, "./commands/"))
        this.events.load(join(__dirname, "./events"))
    }
}

export default CordX
