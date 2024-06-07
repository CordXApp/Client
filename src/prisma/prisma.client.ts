import { UserClient } from "./clients/users/user.client";
import { StatsClient } from "./clients/users/stats.client";
import { UserDomClient } from "./clients/users/domain.client";
import { WebhookClient } from "./clients/admin/hook.client";
import { PartnerClient } from "./clients/admin/partner.client";
import { SecretClient } from "./clients/admin/secret.client";
import { ReportClient } from "./clients/support/report.client";
import { Modules } from "../modules/base.module";
import { PrismaClient } from '@prisma/client';
import type CordX from "../client/cordx";
import Logger from "../utils/logger.util";

const prismaClient = new PrismaClient();

export class DatabaseClient {
    private client: CordX
    public logs: Logger
    public prisma: PrismaClient
    public user: UserClient
    public stats: StatsClient
    public domain: UserDomClient
    public webhook: WebhookClient
    public partner: PartnerClient
    public secret: SecretClient
    public report: ReportClient
    public modules: Modules;

    constructor(client: CordX) {
        this.client = client;
        this.prisma = prismaClient;
        this.logs = new Logger("[DATABASE]")
        this.user = new UserClient(this.client, this.prisma, this.logs);
        this.stats = new StatsClient(this.client, this.prisma, this.logs);
        this.domain = new UserDomClient(this.client, this.prisma, this.logs);
        this.webhook = new WebhookClient(this.client, this.prisma, this.logs);
        this.partner = new PartnerClient(this.client, this.prisma, this.logs);
        this.secret = new SecretClient(this.client, this.prisma, this.logs);
        this.report = new ReportClient(this.client, this.prisma, this.logs);
        this.modules = new Modules(this.client, this.prisma);
    }
}
