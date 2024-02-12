import { join } from "node:path"
import Config from "../config/main.config"
import helpConfig from "../config/help.config"
import { CordxEmbed } from "../utils/Embeds"
import { ClientUtils } from "../utils/Helper"
import { DatabaseManager } from "../managers/Database"
import { PermissionsManager } from "../managers/Permissions"
import { Client, ClientOptions, Collection } from "discord.js"
import { CordXSystem } from "@cordxapp/client"
import type { IConfig, IHelpConfig } from "../types/client"
import { Sequelize } from "../managers/Sequelize"
import PrivateManager from "../managers/Private"
import CommandManager from "../managers/Commands"
import EventManager from "../managers/Listeners"
import RestManager from "../managers/Restful"
import { Snaily } from "../managers/Snaily"
import { API } from "../managers/API"
import Logger from "../utils/Logger"

class CordX extends Client {
    public db: DatabaseManager = new DatabaseManager(this, process.env.DB_URI as string)
    public cooldown = new Collection<string, Collection<string, number>>()
    public perms: PermissionsManager = new PermissionsManager(this)
    public commands: CommandManager = new CommandManager(this)
    public private: PrivateManager = new PrivateManager(this)
    public events: EventManager = new EventManager(this)
    public restApi: RestManager = new RestManager(this)
    public utils: ClientUtils = new ClientUtils(this)
    public sql: Sequelize = new Sequelize(this)
    public logs: Logger = new Logger("Client")
    public System: CordXSystem = new CordXSystem()
    public api: API = new API(this)
    public Embeds: any = CordxEmbed
    public config: IConfig = Config
    public help: IHelpConfig = helpConfig

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
        this.events.load(join(__dirname, "./events/"))
    }
}

export default CordX
