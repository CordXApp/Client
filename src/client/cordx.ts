import { join } from "node:path"
import Config from "../config/main.config"
import helpConfig from "../config/help.config"
import { CordxEmbed } from "../utils/embed.util"
import { Utilities } from "../utils/helper.util"
import { DatabaseClient } from "../prisma/prisma.client";
import { Client, ClientOptions, Collection } from "discord.js"
import type { IConfig, IHelpConfig } from "../types/client"
import PrivateManager from "../managers/private.manager"
import CommandManager from "../managers/command.manager"
import EventManager from "../managers/listener.manager"
import CordXServer from "../server/server";
import RestManager from "../managers/restful.manager";
import Logger from "../utils/logger.util";
import { Snaily } from "../types/database/errors"

class CordX extends Client {
    public EmbedBuilder: any = CordxEmbed
    public db: DatabaseClient = new DatabaseClient(this)
    public cooldown = new Collection<string, Collection<string, number>>()
    public commands: CommandManager = new CommandManager(this)
    public private: PrivateManager = new PrivateManager(this)
    public events: EventManager = new EventManager(this)
    public restApi: RestManager = new RestManager(this)
    public utils: Utilities = new Utilities(this)
    public logs: Logger = new Logger("Client")
    public server = new CordXServer(this)
    public help: IHelpConfig = helpConfig
    public config: IConfig = Config

    private errInitialized: boolean = false;

    constructor(options: ClientOptions) {
        super(options)
        this.init()
        this.handleErrors();
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

    private handleErrors(): void {
        if (this.errInitialized) {
            return;
        }

        process.on('unhandledRejection', async (reason, promise) => {
            this.handleAndLogError('unhandledRejection', reason);
        });

        process.on('uncaughtException', async (err) => {
            this.handleAndLogError('uncaughtException', err);
        });

        process.on('rejectionHandled', (promise: Promise<any>) => {
            this.logs.info(`Promise rejection handled: ${promise}`);
        });

        process.on('warning', (warning: Error | Snaily) => {
            this.logs.warn(`Warning: ${warning.message}`);
        });

        process.on('uncaughtExceptionMonitor', async (err) => {
            this.logs.warn(`Uncaught Exception Monitor: ${err.message}`);
            this.handleAndLogError('uncaughtExceptionMonitor', err);
        });

        this.errInitialized = true;
    }

    private async handleAndLogError(eventType: string, error: Error | any): Promise<void> {
        if (error.isErrorHandled) {
            return;
        }

        error.isErrorHandled = true;

        try {
            this.logs.error(`Error occurred in ${eventType}: ${error.message}`);
            await this.reportErrorToDatabase(eventType, error);
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.logs.error(`Error handling failed: ${err.message}`);
                this.logs.debug(err.stack as string)
            }
        }
    }

    private async reportErrorToDatabase(eventType: string, error: Error | any): Promise<void> {
        const errorObj = {
            info: error.name,
            trace: new Error().stack as string,
            stack: error.stack
        };

        await this.db.snaily.error.throw({
            message: error.message,
            opts: {
                state: 'OPEN',
                type: 'CLIENT_ERR',
                status: `SIGSEGCORDXV:${eventType.toUpperCase()}`,
                message: error.message,
                reporter: 'Snaily',
                error_obj: errorObj
            }
        });
    }
}

export default CordX
