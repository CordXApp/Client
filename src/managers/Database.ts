import mongo from "mongoose"
import type CordX from "../client/CordX"
import { CordXErrors } from "../utils/ErrorSchema"
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
    public snaily: typeof CordXErrors

    constructor(client: CordX, url: string) {
        this.logs = new Logger("Database")
        this.client = client
        this.url = url
        this.mongo = mongo
        this.reports = ReportModel
        this.users = UserModel
        this.snaily = CordXErrors
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

    public async monitorDomains(): Promise<void> {
        try {
            const users = await this.mongo.models.cordxUsers?.find();
            if (!users) return this.logs.error("Failed to fetch users from database.");

            this.logs.info("Monitoring domains to check for verification status.");

            setInterval(async () => {

                const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

                for (const user of users) {
                    if (!user.domains) continue;
                    for (const domain of user.domains) {
                        if (domain.createdAt < thirtyDaysAgo && !domain.verified) {
                            this.logs.info(`Domain: ${domain.name} for user: ${user.id} was not verified within 30 days.`);
                            user.domains = user.domains.filter((d: any) => d.name !== domain.name);
                            await user.save().catch((error: Error) => this.logs.error(error.message));
                        }
                    }
                }
            }, 24 * 60 * 60 * 1000)
        } catch (error: any) {
            return this.logs.error(error.stack)
        }
    }

    public async updateDomainSchema(): Promise<void> {
        try {
            const users = await this.mongo.models.cordxUsers?.find();
            if (!users) return this.logs.error("Failed to fetch users from database.");

            for (const user of users) {
                if (!user.domains) continue;
                for (const domain of user.domains) {
                    if (domain.verified) continue;

                    if (!domain.createdAt) {
                        domain.createdAt = Date.now();
                        this.logs.info(`Domain: ${domain.name} for user: ${user.id} has been updated.`)
                        await user.save().catch((error: Error) => this.logs.error(error.message));
                    }

                    if (!domain.updatedAt) {
                        domain.updatedAt = Date.now();
                        this.logs.info(`Domain: ${domain.name} for user: ${user.id} has been updated.`)
                        await user.save().catch((error: Error) => this.logs.error(error.message));
                    }
                }
            }
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

    public async addGuildRoles(id: string, position: 'owner' | 'admin' | 'moderator' | 'support' | 'developer' | 'beta'): Promise<void> {
        try {

            const name = this.client.users.cache.get(id as string)?.username ? this.client.users.cache.get(id as string)?.username : id;
            const user = await this.mongo.models.cordxUsers?.findOne({ id: Number(id) });

            if (user == null || !user) return this.logs.info(`Unable to locate user: ${name}`);

            if (!user.userId) this.mongo.models.cordxUsers?.findOneAndUpdate({
                id: Number(id)
            }, {
                $set: {
                    userId: id as string
                }
            }, {
                setDefaultsOnInsert: true
            }).then(() => {
                this.logs.info(`Updated user: ${name}, they were missing the userId field.`);
            }).catch((error: Error) => {
                this.logs.error(`Failed to update the "userId" field for user: ${name}`);
                this.logs.error(error.message);
                throw error
            });

            if (user[position]) return;

            await this.mongo.models.cordxUsers?.findOneAndUpdate({
                id: Number(id)
            }, {
                $set: {
                    [position]: true
                }
            }, {
                new: true,
                setDefaultsOnInsert: true
            }).then(() => {
                this.logs.info(`Added user: ${name} to ${position}`);
            }).catch((error: Error) => {
                this.logs.error(`Failed to add user: ${name} to ${position}: ${error.message}`);
                throw error;
            });

        } catch (error: any) { throw error }
    }

    public async removeGuildRoles(id: string, position: 'owner' | 'admin' | 'moderator' | 'support' | 'developer' | 'beta'): Promise<void> {
        try {

            const name = this.client.users.cache.get(id as string)?.username ? this.client.users.cache.get(id as string)?.username : id;
            const user = await this.mongo.models.cordxUsers?.findOne({ id: Number(id) });

            if (user == null || !user) return this.logs.info(`Unable to locate user: ${name}`);

            if (!user[position]) return;

            await this.mongo.models.cordxUsers?.findOneAndUpdate({
                id: Number(id)
            }, {
                $set: {
                    [position]: false
                }
            }, {
                new: true,
                setDefaultsOnInsert: true
            }).then(() => {
                this.logs.info(`Removed user: ${name} from ${position}`);
            }).catch((error: Error) => {
                this.logs.error(`Failed to remove user: ${name} from ${position}: ${error.message}`);
                throw error;
            });

        } catch (error: any) { throw error }
    }

    public async verifyUserModel(id: string): Promise<void> {
        try {
            const user = await this.mongo.models.cordxUsers?.findOne({ id: Number(id) });

            const updates: any = {};

            if (!user.userId) updates.userId = id as string;
            if (user.owner === null || user.owner === undefined) updates.owner = false;
            if (user.admin === null || user.admin === undefined) updates.admin = false;
            if (user.moderator === null || user.moderator === undefined) updates.moderator = false;
            if (user.support === null || user.support === undefined) updates.support = false;
            if (user.developer === null || user.developer === undefined) updates.developer = false;
            if (user.banned === null || user.banned === undefined) updates.banned = false;
            if (user.verified === null || user.verified === undefined) updates.verified = false;
            if (user.beta === null || user.beta === undefined) updates.beta = false;
            if (!user.active_domain) updates.active_domain = 'none';
            if (!user.domains) updates.domains = [];

            const response = await fetch(`https://discord.com/api/v9/users/${Number(id)}`, {
                headers: {
                    'Authorization': `Bot ${this.client.token}`,
                }
            });

            if (!response.ok) return this.logs.error(`Failed to fetch user: ${Number(id).toString()} from Discord API`);

            const duser: any = await response.json();
            console.log(duser.username)

            if (Object.keys(updates).length === 0) return;

            this.logs.info(`Detected missing fields for user: ${Number(id)}`);

            const originalUser = { ...user.toObject() };

            for (const key in updates) {
                user[key] = updates[key];
                user.markModified(key);
            }

            for (const key in updates) {
                if (originalUser[key] === undefined || originalUser[key] === null || originalUser[key] === false || originalUser[key] !== user[key]) {
                    this.logs.info(`Field ${key} changed from ${originalUser[key] === undefined ? 'undefined' : originalUser[key] === null ? 'null' : originalUser[key] === false ? 'false' : originalUser[key]} to ${user[key] === undefined ? 'undefined' : user[key] === null ? 'null' : user[key] === false ? 'false' : user[key]}`);
                }
            }

            await user.save().catch((error: Error) => this.logs.error(error.message));

            this.logs.info(`Updated user: ${id} successfully.`);

        } catch (error: any) { throw error };
    }

    public async correctIdentifiers(): Promise<void> {
        const incorrect = await this.mongo.models.cordxUsers?.find();
        const correct = await this.mongo.models.oauth?.find();

        if (!incorrect || !correct) return;

        for (const i of incorrect) {
            for (const c of correct) {
                if (Number(c.id) === i.id) {
                    this.logs.info(`Match found for user: ${i.id} with correct identifier: ${c.id}`);
                    i.userId = c.id as string;
                    i.markModified('userId');
                    await i.save().then(() => {
                        this.logs.info(`Updated user: ${i.id} with correct identifier: ${c.id}`);
                    }).catch((error: Error) => this.logs.error(error.message));
                    break;
                }
            }
        }
    }

    public async verifyAllUserModels(): Promise<void> {
        try {
            const users = await this.mongo.models.cordxUsers?.find();

            if (!users) return this.logs.info("Bruhh, database go brrrrr!!!");

            for (const user of users) {
                const updates: any = {};

                if (!user.userId) updates.userId = user.id as string;
                if (user.owner === null || user.owner === undefined) updates.owner = false;
                if (user.admin === null || user.admin === undefined) updates.admin = false;
                if (user.moderator === null || user.moderator === undefined) updates.moderator = false;
                if (user.support === null || user.support === undefined) updates.support = false;
                if (user.developer === null || user.developer === undefined) updates.developer = false;
                if (user.banned === null || user.banned === undefined) updates.banned = false;
                if (user.verified === null || user.verified === undefined) updates.verified = false;
                if (user.beta === null || user.beta === undefined) updates.beta = false;
                if (!user.active_domain) updates.active_domain = 'none';
                if (!user.domains) updates.domains = [];

                if (Object.keys(updates).length === 0) continue;

                this.logs.info(`Detected missing fields for user: ${Number(user.id)}`);

                const originalUser = { ...user.toObject() };

                for (const key in updates) {
                    user[key] = updates[key];
                    user.markModified(key);
                }

                for (const key in updates) {
                    if (originalUser[key] === undefined || originalUser[key] === null || originalUser[key] === false || originalUser[key] !== user[key]) {
                        this.logs.info(`Field ${key} changed from ${originalUser[key] === undefined ? 'undefined' : originalUser[key] === null ? 'null' : originalUser[key] === false ? 'false' : originalUser[key]} to ${user[key] === undefined ? 'undefined' : user[key] === null ? 'null' : user[key] === false ? 'false' : user[key]}`);
                    }
                }

                await user.save().catch((error: Error) => this.logs.error(error.message));

                this.logs.info(`Updated user: ${user.id} successfully.`);
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
