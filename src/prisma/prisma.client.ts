import { UserClient } from "./clients/users/user.client";
import { StatsClient } from "./clients/users/stats.client";
import { UserDomClient } from "./clients/users/domain.client";
import { WebhookClient } from "./clients/admin/hook.client";
import { PartnerClient } from "./clients/admin/partner.client";
import { SecretClient } from "./clients/admin/secret.client";
import { ReportClient } from "./clients/support/report.client";
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

    constructor(client: CordX) {
        this.client = client;
        this.prisma = prismaClient;
        this.logs = new Logger("[DATABASE]")
        this.user = new UserClient(this.client);
        this.stats = new StatsClient(this.client);
        this.domain = new UserDomClient(this.client);
        this.webhook = new WebhookClient(this.client);
        this.partner = new PartnerClient(this.client);
        this.secret = new SecretClient(this.client);
        this.report = new ReportClient(this.client);
    }
}
