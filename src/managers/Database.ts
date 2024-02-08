import mongo from "mongoose"
import type CordX from "../client/CordX"
import { ReportModel } from "../utils/ReportSchema"
import { UserModel } from "../utils/UserSchema"
import Logger from "../utils/Logger"

export class DatabaseManager {
    public client: CordX
    private url: string
    public logs: Logger
    public mongo: typeof mongo
    public reports: typeof ReportModel
    public users: typeof UserModel

    constructor(client: CordX, url: string) {
        this.logs = new Logger("Database")
        this.client = client
        this.url = url
        this.mongo = mongo
        this.reports = ReportModel
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

    public async updateUserPosition(id: string, position: 'owner' | 'admin' | 'mod' | 'support' | 'developer' | 'beta'): Promise<void> {
        try {

            const user = await this.mongo.models.cordxUsers?.findOne({ id: Number(id) });

            const name = this.client.users.cache.get(`${id}`)?.username ? this.client.users.cache.get(`${id}`)?.username : id;

            if (user == null || !user) return this.logs.info(`Unable to locate user: ${name}`);

            if (position === 'owner') user.owner = true;
            if (position === 'admin') user.admin = true;
            if (position === 'mod') user.moderator = true;
            if (position === 'support') user.support = true;
            if (position === 'developer') user.developer = true;
            if (position === 'beta') user.beta = true;

            if (!user.userId) user.userId = id as string;

            await user.save().catch((err: Error) => { throw err });

            const updatedUser = await this.mongo.models.cordxUsers?.findOne({ id: Number(id) });

            if (position === 'admin' && updatedUser?.admin) return;
            if (position === 'mod' && updatedUser?.moderator) return;
            if (position === 'support' && updatedUser?.support) return;

            this.client.logs.info(`Added user: ${name} to position: ${position}`);

        } catch (error: any) { throw error }
    }

    public async verifyUserModel(id: string): Promise<void> {
        try {
            const user = await this.mongo.models.cordxUsers?.findOne({ id: id });

            if (!user) {

                const newUser = new this.mongo.models.cordxUsers!({
                    id: Number(id),
                    userId: id as string,
                    owner: false,
                    admin: false,
                    moderator: false,
                    support: false,
                    developer: false,
                    banned: false,
                    verified: false,
                    beta: false,
                    active_domain: 'none',
                    domains: []
                });

                await newUser.save().then(() => {
                    this.logs.info(`Created user: ${id}`);
                }).catch((error: Error) => { throw error; })
            }

            if (user && !user.userId) {
                user.userId = id as string;
                await user.save().then(() => {
                    this.logs.info(`Updated user: ${id}, they were missing the userId field.`);
                }).catch((error: Error) => { throw error; })
            }

        } catch (error: any) { throw error };
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

    public async createReport(type: string, author: string, reason: string): Promise<any> {

        const id = await this.client.utils.generateId();

        const report = new ReportModel({
            id: id,
            type: type,
            author: author,
            reason: reason,
            status: "pending"
        });

        await report.save().catch((error: Error) => {
            this.logs.error(error.stack as string);
            return { success: false, message: "Failed to create report.", error: error.message }
        })

        return { success: true, message: "Report created successfully." };
    }

    public async getReport(id: string): Promise<any> {

        const report = await this.mongo.models.reports?.findOne({ id: id });

        if (!report) return { success: false, message: "Report not found." };

        return { success: true, report: report };
    }

    public async updateReportReason(id: string, requester: string, reason: string): Promise<any> {

        const report = await this.mongo.models.reports?.findOne({ id: id });

        if (!report) return { success: false, message: "Unable to locate a report with the provided snowflake." };

        if (['accepted', 'rejected', 'resolved'].includes(report.status)) {
            return { success: false, message: "Unable to update the reason for this report as it is no longer in a \`pending\` state." };
        }

        if (report.author !== requester) return { success: false, message: "You are not authorized to update this report." };

        const oldReason = report.reason;
        const newReason = reason;

        report.reason = newReason;

        await report.save().catch((error: Error) => {
            this.logs.error(error.stack as string);
            return { success: false, message: "Failed to update report.", error: error.message }
        })

        return { success: true, message: `Your report message has been updated.`, oldReason: oldReason, newReason: newReason };
    }

    public async updateReportStatus(id: string, requester: string, status: string): Promise<any> {

        const report = await this.mongo.models.reports?.findOne({ id: id });

        if (!report) return { success: false, message: "Unable to locate a report with the provided snowflake." };

        if (['accepted', 'rejected', 'resolved'].includes(report.status)) {
            return { success: false, message: "Unable to update the status for this report as it is no longer in a \`pending\` state." };
        }

        const oldStatus = report.status;
        const newStatus = status;

        report.status = newStatus;

        await report.save().catch((error: Error) => {
            this.logs.error(error.stack as string);
            return { success: false, message: "Failed to update report.", error: error.message }
        })

        return { success: true, message: `Your report status has been updated.`, oldStatus: oldStatus, newStatus: newStatus };
    }
}
