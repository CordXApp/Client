import type CordX from "../client/cordx"
import { UserConfig } from "../types/database/users";
import { version } from "../../package.json";
import Logger from "../utils/logger.util"
import fetch from 'node-fetch';

export class API {
    public client: CordX
    public logs: Logger
    public domain: string

    constructor(client: CordX) {
        this.client = client
        this.logs = new Logger("API_MANAGER")
        this.domain = 'https://api.cordx.lol/v3/'
    }

    public async request(method: string, endpoint: string): Promise<any> {

        let url = `${this.domain}${endpoint}`

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.status !== 200) return { error: true, status: response.status, message: response.statusText };

        const data = await response.json() || response.text();

        return { error: false, data: data };
    }

    public async generateUserConfig(id: string, secret: string, domain?: string): Promise<any> {
        const config: UserConfig = {
            Version: version,
            Name: domain ? `${domain}` : 'cordx.lol',
            DestinationType: 'ImageUploader, FileUploader',
            RequestMethod: 'POST',
            RequestURL: domain ? `https://${domain}/api/upload/sharex` : 'https://cordx.lol/api/upload/sharex',
            Headers: {
                userid: id,
                secret: secret
            },
            Body: 'MultipartFormData',
            FileFormName: 'sharex',
            URL: '{json:url}'
        }

        return config;
    }

    public async uploadFile(user: string, secret: string, file: any): Promise<any> {
        const response = await fetch(`https://cordx.lol/api/upload/sharex`, {
            method: 'POST',
            headers: {
                userid: user,
                secret: secret
            },
            body: file,
        })
    }

    public async eightBall(question: string): Promise<string> {
        const response = await this.request('GET', 'client/8ball');

        if (response.error) return response.error.message;

        return response.data.response;
    };

    public async generateAdvice(): Promise<string> {
        const response = await this.request('GET', 'client/advice/random');

        if (response.error) return response.error.message;

        return response.data.advice;
    }
}

