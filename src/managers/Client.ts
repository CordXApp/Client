import type CordX from '../client/CordX';
import Logger from '../utils/Logger';
import DNS from 'node:dns';

export class CustomDomains {
    public client: CordX;
    public logs: Logger
    public domain: string;
    public txtName?: string;
    public dnsClient: typeof DNS;

    constructor(client: CordX, domain: string, txtName?: string) {
        this.dnsClient = DNS;
        this.client = client;
        this.logs = new Logger('Custom Domains');
        this.domain = domain;
        this.txtName = txtName;
    }

    public async checkTxtRecord(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const ipRegex = new RegExp(/(\d{1,3}\.){3}\d{1,3}/g);

            this.logs.info(`Checking TXT record for ${this.domain}`);
            this.logs.info(`TXT record name: ${this.txtName}`);

            if (!this.txtName) return reject(new Error('No TXT record name provided.'));
            if (!this.domain) return reject(new Error('No domain provided.'));
            if (!ipRegex.test(this.domain)) return reject(new Error('IP Addresses are not supported.'));

            const parts = this.domain.split('.');
            const main = parts.slice(-2).join('.');

            if (main === 'localhost') return reject(new Error('Localhost is not supported.'));

            DNS.resolveTxt(main, (err, records) => {
                if (err) return reject(err);
                if (!records) return reject(new Error('No TXT records found.'));
                
                const hasTxtRecord = records.some((record) => record.includes(this.txtName!));

                this.logs.info(hasTxtRecord ? 'TXT record found.' : 'TXT record not found.');

                resolve(hasTxtRecord)
            })

        })
    }

    public async isDomainValid(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const ipRegex = new RegExp(/(\d{1,3}\.){3}\d{1,3}/g);

            this.logs.info(`Checking domain: ${this.domain}`);

            if (!this.domain) return reject(false);
            if (ipRegex.test(this.domain)) return reject(false);

            const pattern = new RegExp('^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$');
            const parts = this.domain.split('.');

            if (parts.length < 2) return reject(false);

            for (let part of parts) {
                if (!pattern.test(part)) return reject(false); 
            }

            return resolve(true);
        })
    }
}