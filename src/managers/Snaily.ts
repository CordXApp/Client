import mongo from "mongoose"
import type CordX from "../client/CordX"
import { ReportModel } from "../utils/ReportSchema"
import { UserModel } from "../utils/UserSchema"
import Logger from "../utils/Logger"
import { CordXErrors } from "../utils/ErrorSchema"

export class Snaily {
    public client: CordX
    public logs: Logger

    constructor(client: CordX) {
        this.logs = new Logger("Snaily")
        this.client = client
    }

    public async getDiagnosticReport(id: string): Promise<any> {
        const snaily = await this.client.db.mongo.models.cordxErrors?.findOne({ reportId: id as string });

        if (!snaily) return { success: false, message: "Diagnostic report not found." };
        if (snaily.ignored) return { success: false, message: "Diagnostic report has been ignored." };
        if (snaily.resolved) return { success: false, message: "Diagnostic report has been resolved." };

        return { success: true, report: snaily };
    }
}
