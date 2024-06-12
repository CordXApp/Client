import { UserClient } from "./clients/users/user.client";
import { EntityClient } from "./clients/entities/entity.client";
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
import { randomBytes } from "node:crypto";

const prismaClient = new PrismaClient();

export class DatabaseClient {
    private client: CordX
    public logs: Logger
    public cornflake: CordXSnowflake;
    public prisma: PrismaClient
    public user: UserClient
    public entity: EntityClient
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
         * Entity Database Client
         */
        this.entity = new EntityClient({
            client: this.client,
            db: this,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * User Database Client
         */
        this.user = new UserClient({
            client: this.client,
            db: this,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        })

        /**
         * User Stats Database Client
         */
        this.stats = new StatsClient({
            client: this.client,
            db: this,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * User Domain Database Client
         */
        this.domain = new UserDomClient({
            client: this.client,
            db: this,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * Webhook Database Client
         */
        this.webhook = new WebhookClient({
            client: this.client,
            db: this,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * Entity Secret Database Client
         */
        this.secret = new SecretClient({
            client: this.client,
            db: this,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * Report Database Client
         */
        this.report = new ReportClient({
            client: this.client,
            db: this,
            prisma: this.prisma,
            logs: this.logs,
            mods: this.modules
        });

        /**
         * Partners Database Client
         */
        this.partner = new PartnerClient({
            client: this.client,
            db: this,
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
