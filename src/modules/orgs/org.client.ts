import CordX from "../../client/cordx";
import Logger from "../../utils/logger.util";

export class OrgModule {
    private client: CordX;
    private logs: Logger;

    constructor(client: CordX,) {
        this.client = client;
        this.logs = new Logger('[ORGANIZATIONS]');
    }
}