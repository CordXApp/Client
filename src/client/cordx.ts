import { join } from "node:path"
import Config from "../config/main.config"
import helpConfig from "../config/help.config"
import { CordxEmbed } from "../utils/embed.util"
import { Utilities } from "../utils/helper.util"
import { DatabaseClient } from "../prisma/prisma.client";
import { ConfigModule } from "../modules/cfg.module";
import { Client, ClientOptions, Collection } from "discord.js"
import type { IConfig, IHelpConfig } from "../types/client"
import { Security } from "../modules/security.module";
import { Spaces } from "../modules/spaces.module";
import PrivateManager from "../managers/private.manager"
import CommandManager from "../managers/command.manager"
import EventManager from "../managers/listener.manager"
import CordXServer from "../server/server";
import RestManager from "../managers/restful.manager";
import { Information } from "../modules/info.module";
import { Webhooks } from "../modules/webhook.module";
import Logger from "../utils/logger.util";

/** CLIENT MODULES */
import { Permissions } from "../modules/permissions.module"
import { FunModule } from "../modules/fun.module"

class CordX extends Client {
    public EmbedBuilder: any = CordxEmbed
    public db: DatabaseClient = new DatabaseClient(this)
    public cooldown = new Collection<string, Collection<string, number>>()
    public perms: Permissions = new Permissions(this)
    public commands: CommandManager = new CommandManager(this)
    public private: PrivateManager = new PrivateManager(this)
    public events: EventManager = new EventManager(this)
    public restApi: RestManager = new RestManager(this)
    public security: Security = new Security(this)
    public spaces: Spaces = new Spaces(this)
    public utils: Utilities = new Utilities(this)
    public logs: Logger = new Logger("Client")
    public server = new CordXServer(this)
    public help: IHelpConfig = helpConfig
    public config: IConfig = Config
    public funmod: FunModule = new FunModule(this)
    public info: Information = new Information(this)
    public webhooks: Webhooks = new Webhooks(this);
    public configs: ConfigModule = new ConfigModule(this)

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
