import mongo, { Model, Document } from 'mongoose';
import type CordX from '../client/CordX';
import Logger from '../utils/Logger';

export class DatabaseManager {
    public client: CordX;
    private url: string;
    public logs: Logger
    public model: any = Model<Document>;

    constructor(client: CordX, url: string) {
        this.client = client;
        this.url = url;
        this.logs = new Logger('Database');
        this.model = mongo.model('cordxUsers');
    }

    public async init(): Promise<void> {
        try {
            await mongo.connect(this.url);
            this.logs.ready(`Connected to: ${this.url.substring(0, 5)}.****`);
        } catch (error: any) {
            return this.logs.error(error.stack);
        }
    }

    public async stop(): Promise<void> {
        try {
            await mongo.disconnect();
            this.logs.info('Disconnected from database.');
        } catch (error: any) {
            return this.logs.error(error.stack);
        }
    }

    public async checkPing(): Promise<void> {
        try {
            await mongo.connection.db.admin().ping();
            this.logs.info('Ping successful.');
        } catch (error: any) {
            return this.logs.error(error.stack);
        }
    }

    public async getUser(id: string): Promise<any> {
        try {
            const user = await this.model.findOne({ id });
            if (!user) return { success: false, message: 'User not found.' }
            return { success: true, user: user };
        } catch (error: any) {
            return this.logs.error(error.stack);
        }
    }
}