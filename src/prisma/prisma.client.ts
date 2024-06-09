import { UserClient } from "./clients/users/user.client";
import { StatsClient } from "./clients/users/stats.client";
import { UserDomClient } from "./clients/users/domain.client";
import { WebhookClient } from "./clients/admin/hook.client";
import { PartnerClient } from "./clients/admin/partner.client";
import { SecretClient } from "./clients/admin/secret.client";
import { ReportClient } from "./clients/support/report.client";
import { CordXSnowflake } from "@cordxapp/snowflake";
import { Modules } from "../modules/base.module";
import { PrismaClient } from '@prisma/client';
import type CordX from "../client/cordx";
import Logger from "../utils/logger.util";

const prismaClient = new PrismaClient();

export class DatabaseClient {
    private client: CordX
    public logs: Logger
    public cornflake: CordXSnowflake;
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

        /**
         * Modules Database Client
         */
        this.modules = new Modules(this.client, this.prisma);

        /**
         * User Database Client
         */
        this.user = new UserClient({
            client: this.client,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * User Stats Database Client
         */
        this.stats = new StatsClient({
            client: this.client,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        this.domain = new UserDomClient({
            client: this.client,
            prisma: this.prisma
        });

        /**
         * Webhook Database Client
         */
        this.webhook = new WebhookClient({
            client: this.client,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        this.secret = new SecretClient({ client: this.client, prisma: this.prisma });

        this.report = new ReportClient({ client: this.client, prisma: this.prisma });

        /**
         * Partners Database Client
         */
        this.partner = new PartnerClient({
            client: this.client,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * Cornflake (Snowflake) ID Generator
         */
        this.cornflake = new CordXSnowflake({
            workerId: 1,
            processId: 1,
            sequence: 5n,
            increment: 1,
            epoch: 1609459200000,
            debug: false
        });
    }
}
