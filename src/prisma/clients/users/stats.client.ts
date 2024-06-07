import { LeaderboardData } from "../../../types/database/users";
import { StatsMethods, Responses } from "../../../types/database/index"
import type CordX from "../../../client/cordx";

export class StatsClient {
    private client: CordX;

    constructor(client: CordX) {
        this.client = client;
    }

    public get model(): StatsMethods {
        return {
            images: async (): Promise<Responses> => {
                const images = await this.client.db.prisma.uploads.findMany();

                if (!images) return { success: false, message: 'No images found, oh the sadness!' };

                return { success: true, data: images.length }
            },
            users: async (): Promise<Responses> => {
                const users = await this.client.db.prisma.users.findMany();

                if (!users) return { success: false, message: 'No users found, oh the sadness!' };

                return { success: true, data: users.length }
            },
            domains: async (): Promise<Responses> => {
                const domains = await this.client.db.prisma.domains.findMany();

                if (!domains) return { success: false, message: 'No domains found, oh the sadness!' };

                return { success: true, data: domains.length }
            },

            leaderboard: async (amount: number): Promise<Responses> => {

                try {

                    if (amount < 1 || amount > 15) return { success: false, message: 'Whoops, the top uploaders count should be between 1 and 15' }

                    const images = await this.client.db.prisma.uploads.findMany();
                    if (!images) return { success: false, message: 'No images found, oh the sadness! Did someone kill our database again?' };

                    const uploaders = images.reduce((acc, upload) => {

                        if (upload.userid) {
                            acc[upload.userid] = (acc[upload.userid] || 0) + 1;
                        }

                        return acc;
                    }, {} as Record<string, number>);

                    const topUploaders = Object.entries(uploaders)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, amount)
                        .map(([userid, count]) => ({ userid, count }));

                    const userArray: LeaderboardData[] = [];

                    for (const [index, user] of topUploaders.entries()) {
                        const position = index + 1;
                        let number = '';

                        const u = await this.client.users.fetch(user.userid);

                        if (position === 1) number = '🥇';
                        if (position === 2) number = '🥈';
                        if (position === 3) number = '🥉';
                        if (position > 3) number = `#${position}`;

                        userArray.push({
                            userid: u.id,
                            username: u.username as string,
                            globalName: u.globalName as string,
                            position: number,
                            total: user.count
                        })
                    }

                    return {
                        success: true,
                        data: userArray.sort((a: any, b: any) => a.unformatted - b.unformatted)
                    }
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        return { success: false, message: err.message }
                    }

                    return { success: false, message: 'An unknown error occurred' }
                }
            }
        }
    }
}
