import type CordX from "../client/CordX"
import mongo, { FilterQuery, Model } from "mongoose"
import { UserModel } from "../utils/UserSchema"
import { UserData } from "../types/user"
import Logger from "../utils/Logger"

export class DatabaseManager {
    public client: CordX
    private url: string
    public logs: Logger
    public mongo: typeof mongo
    private users = UserModel

    constructor(client: CordX, url: string) {
        this.logs = new Logger("Database")
        this.client = client
        this.url = url
        this.mongo = mongo
        this.users = UserModel
    }

    public async init(): Promise<void> {
        try {
            await mongo.connect(this.url)
            this.logs.ready(`Connected to: ${this.url.substring(0, 5)}.****`)
        } catch (error: any) {
            return this.logs.error(error.stack)
        }
    }

    public async stop(): Promise<void> {
        try {
            await mongo.disconnect()
            this.logs.info("Disconnected from database.")
        } catch (error: any) {
            return this.logs.error(error.stack)
        }
    }

    public async checkPing(): Promise<void> {
        try {
            await mongo.connection.db.admin().ping()
            this.logs.info("Ping successful.")
        } catch (error: any) {
            return this.logs.error(error.stack)
        }
    }

    public async getUser(id: string): Promise<any> {
        try {
            const user = await this.mongo.models.cordxUsers?.findOne({ id: id });
            if (!user) return { success: false, message: "User not found." }
            return { success: true, user: user }
        } catch (error: any) {
            return this.logs.error(error.stack)
        }
    }

    public async getUserDomains(id: string): Promise<any> {
        try {
            const user = await this.mongo.models.cordxUsers?.findOne({ id: id });
            if (!user) return { success: false, message: "User not found." }
            return { success: true, domains: user.domains }
        } catch (error: any) {
            return this.logs.error(error.stack)
        }
    }

    public async getOneUserDomain(id: string, domain: string): Promise<any> {

        this.logs.info(`Looking for user: ${id} with domain: ${domain}`);

        const domCheck = await this.mongo.models.cordxUsers?.findOne({ domains: { $elemMatch: { name: domain } } });

        if (!domCheck) return { success: false, message: "Unable to locate that domain" }

        const dom = domCheck.domains.find((d: any) => d.name === domain);

        if (!dom) return { success: false, message: "Unable to locate that domain" }
        if (dom.name !== domain) return { success: false, message: "Unable to locate that domain" }
        if (!dom.verified) return { success: false, message: "Domain is not verified, please verify it first" }

        this.logs.info(`Found domain: ${dom.name} for user: ${id}`);

        return { success: true, domain: dom }
    }
}
