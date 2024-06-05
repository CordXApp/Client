import CordX from "../client/cordx";
import Logger from "../utils/logger.util";
import { ConfigModule } from "./client/cfg.module";
import { FunModule } from "./client/fun.module";
import { Information } from "./client/info.module";
import { OrgModule } from "./client/org.module";
import { Permissions } from "./client/permissions.module";
import { Security } from "./misc/security.module";
import { Spaces } from "./misc/spaces.module";
import { Webhooks } from "./misc/webhook.module";


export class ClientModules {
    public client: CordX;
    private logs: Logger;
    public configs: ConfigModule;
    public funmod: FunModule;
    public info: Information;
    public orgs: OrgModule;
    public perms: Permissions;
    public security: Security;
    public spaces: Spaces;
    public webhooks: Webhooks;


    constructor(client: CordX) {
        this.client = client;
        this.logs = new Logger('[MODULES]');
        this.configs = new ConfigModule(client);
        this.funmod = new FunModule(client);
        this.info = new Information(client);
        this.orgs = new OrgModule(client);
        this.perms = new Permissions(client);
        this.security = new Security(client);
        this.spaces = new Spaces(client);
        this.webhooks = new Webhooks(client);
    }
}