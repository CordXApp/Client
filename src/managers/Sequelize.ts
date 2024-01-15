import mysql from 'serverless-mysql';
import * as SQLTypes from '../types/sql/index'
import type CordX from "../client/CordX"
import Logger from "../utils/Logger"

export class Sequelize {
    public client: CordX
    private logger: Logger = new Logger("Sequelize")
    private sql = mysql({
        config: {
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASS,
            database: process.env.SQL_NAME,
        }
    });

    constructor(client: CordX) { this.client = client };

    private async query({ query }: SQLTypes.Query): Promise<any> {
        try {
            const res = await this.sql.query(query);
            await this.sql.end();

            return { success: true, data: res }
        } catch (err: any) {
            this.logger.error(err.stack)
            return { success: false, data: err.message }
        }
    }

    public async topFiveUploaders() {

        this.logger.info("Fetching top 5 uploaders...");

        const leaderboard: any = await this.query({
            query: `
            SELECT userid, COUNT(*) as imageCount
            FROM images
            GROUP BY userid
            ORDER BY imageCount DESC
            LIMIT 5
        `}).catch((err: Error) => {
            this.logger.error(err.stack as string)
            return { success: false, data: err.message }
        });

        const userArray: any = [];

        await Promise.all(leaderboard.data.map(async (user: any, index: any) => {
            const position = index + 1;
            let number = ''
        
            let u = await this.client.users.fetch(user.userid).catch(() => user.userid);
        
            if (position === 1) number = `🥇`
            if (position === 2) number = `🥈`
            if (position === 3) number = `🥉`
            if (position === 4) number = `#${position}`
            if (position === 5) number = `#${position}` 
        
            userArray.push({
                userid: user.userid,
                username: u?.username,
                globalName: u?.globalName,
                imageCount: user.imageCount,
                position: number,
                unformatted: position
            })
        })).catch((err: Error) => {
            this.logger.error(err.stack as string)
            return { success: false, data: err.message }
        });

        return { success: true, data: userArray.sort((a: any, b: any) => a.unformatted - b.unformatted) };
    }
}