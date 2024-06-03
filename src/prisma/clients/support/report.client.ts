import { Responses } from "../../../types/database/index"
import { Report } from "../../../types/database/reports";
import type CordX from "../../../client/cordx";
import { TextChannel } from "discord.js";

export class ReportClient {
    private client: CordX

    constructor(client: CordX) {
        this.client = client;
    }

    public get model() {
        return {
            /**
             * Create a new report and save it to the database
             * @param {Report} data - The data to create the report with
             * @returns {Responses} - The response from the database
             * @example
             */
            create: async (data: Report): Promise<Responses | any> => {

                const id = await this.client.utils.base.createReportId();
                const guild = await this.client.guilds.cache.get('871204257649557604');
                const channel = await guild?.channels.fetch('1235836201559134259');

                this.client.db.logs.debug(JSON.stringify(data));

                const report = await this.client.db.prisma.reports.create({
                    data: {
                        id: id as string,
                        type: data.type,
                        author: data.author,
                        reason: data.reason,
                        status: 'OPEN',
                        mod: null,
                    }
                }).catch((err: Error) => {
                    this.client.db.logs.error(`Failed to create report: ${err.message}`);
                    this.client.db.logs.debug(`Stack trace: ${err.stack}`);
                    return { success: false, message: err.message }
                })

                if (channel && channel instanceof TextChannel) await channel.send({
                    content: '<@&1138246343412953218>',
                    embeds: [
                        new this.client.EmbedBuilder({
                            title: 'New Report',
                            description: `A new report has been filed by ${data.author}!`,
                            color: this.client.config.EmbedColors.base,
                            fields: [{
                                name: 'ID',
                                value: `\`${id as string}\``,
                                inline: true
                            }, {
                                name: 'Type',
                                value: `\`${data.type}\``,
                                inline: true
                            }, {
                                name: 'Status',
                                value: `\`OPEN\``,
                                inline: true
                            }, {
                                name: 'Reason',
                                value: `\`${data.reason}\``,
                                inline: false
                            }]
                        })
                    ]
                })

                return { success: true, data: report };
            },
            list: async (author: string): Promise<Responses> => {

                const reports = await this.client.db.prisma.reports.findMany({ where: { author: author } });

                if (!reports) return { success: false, message: 'No reports found for that user!' };

                return { success: true, data: reports }
            },
            fetch: async (id: string, user: string): Promise<Responses> => {

                const report = await this.client.db.prisma.reports.findUnique({ where: { id: id } });

                const db_user = await this.client.db.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                });

                if (!report) return { success: false, message: 'No report found with that ID!' };

                if (db_user && report.author !== user && !db_user.permissions.some(permission => permission.name === 'STAFF')) return {
                    success: false,
                    message: 'Sorry chief, you do not posess the powers necessary to view this report!'
                };

                return { success: true, data: report }
            }
        }
    }
}
