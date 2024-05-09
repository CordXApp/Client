import { join } from "node:path"
import Config from "../config/main.config"
import helpConfig from "../config/help.config"
import { CordxEmbed } from "../utils/Embeds"
import { Utilities } from "../utils/Helper"
import { DatabaseManager } from "../managers/Database"
import { PermissionsManager } from "../managers/Permissions"
import { Client, ClientOptions, Collection } from "discord.js"
import type { IConfig, IHelpConfig } from "../types/client"
import { SecurityModule } from "../modules/security.module";
import { SpacesModule } from "../modules/spaces.module";
import PrivateManager from "../managers/Private"
import CommandManager from "../managers/Commands"
import EventManager from "../managers/Listeners"
import { CordXSystem } from "@cordxapp/client";
import CordXServer from "../server/server";
import RestManager from "../managers/Restful";
import { API } from "../managers/API";
import Logger from "../utils/Logger";

class CordX extends Client {
    public api: API = new API(this)
    public db: DatabaseManager = new DatabaseManager(this)
    public cooldown = new Collection<string, Collection<string, number>>()
    public perms: PermissionsManager = new PermissionsManager(this)
    public commands: CommandManager = new CommandManager(this)
    public private: PrivateManager = new PrivateManager(this)
    public events: EventManager = new EventManager(this)
    public restApi: RestManager = new RestManager(this)
    public security: SecurityModule = new SecurityModule(this)
    public spaces: SpacesModule = new SpacesModule(this)
    public utils: Utilities = new Utilities(this)
    public System: CordXSystem = new CordXSystem()
    public logs: Logger = new Logger("Client")
    public server = new CordXServer(this)
    public help: IHelpConfig = helpConfig
    public Embeds: any = CordxEmbed
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
        this.private.load(join(__dirname, "./commands/private/"))
        this.commands.load(join(__dirname, "./commands/public/"))
        this.events.load(join(__dirname, "./events/"))
    }
}

export default CordX
