import CordX from "../../client/cordx";
import Logger from "../../utils/logger.util";
import { OrgMembers } from "./org.members";

export class OrgModule {
    public client: CordX;
    private logs: Logger;


    constructor(client: CordX) {
        this.client = client;
        this.logs = new Logger('[ORGANIZATIONS]');

    }
}