import type CordX from "../client/CordX"
import Logger from "../utils/Logger"
import fetch from 'node-fetch';

export class API {
    public client: CordX
    public logs: Logger
    public domain: string

    constructor(client: CordX) {
        this.client = client
        this.logs = new Logger("Custom Domains")
        this.domain = 'https://api.cordx.lol/v3/'
    }

    public async request(method: string, endpoint: string): Promise<any> {

        let url = `${this.domain}${endpoint}`

        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });

        if (response.status !== 200) return { error: true, status: response.status, message: response.statusText };

        const data = await response.json() || response.text();

        return { error: false, data: data };
    }
}

