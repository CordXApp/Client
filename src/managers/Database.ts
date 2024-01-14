import type CordX from "../client/CordX"
import Logger from "../utils/Logger"
import mongo from "mongoose"

export class DatabaseManager {
    public client: CordX
    private url: string
    public logs: Logger
    public mongo: typeof mongo

    constructor(client: CordX, url: string) {
        this.logs = new Logger("Database")
        this.client = client
        this.url = url
        this.mongo = mongo
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
        try {
            const user = await this.mongo.models.cordxUsers?.findOne({ id: id });
            if (!user) return { success: false, message: "User not found." }
            const userDomain = user.domains.find((d: any) => d.name === domain)
            if (!userDomain) return { success: false, message: "Domain not found." }
            return { success: true, domain: userDomain }
        } catch (error: any) {
            return this.logs.error(error.stack)
        }
    }
}
