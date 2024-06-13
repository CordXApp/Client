import { Throw, Snaily, WebhookParams, ErrorObject } from "../../../types/database/errors";
import { DatabaseClient } from "../../prisma.client";
import { Constructor } from "../../../types/database/clients";
import { Modules } from "../../../modules/base.module";
import Logger from "../../../utils/logger.util";
import { PrismaClient } from '@prisma/client';
import { Responses } from "../../../types/database/index"
import axios from "axios";


export class ErrorClient {
    private logs: Logger;
    private prisma: PrismaClient;
    private db: DatabaseClient;
    private mods: Modules;

    constructor(data: Constructor) {
        this.logs = data.logs;
        this.prisma = data.prisma;
        this.db = data.db;
        this.mods = data.mods;
    }

    public get error() {
        return {
            create: async (params: Throw): Promise<Responses> => {

                const id = this.db.cornflake.generate();

                const test = await this.db.prisma.errors.findUnique({ where: { id } });

                if (test) return this.error.create(params);

                const err = await this.prisma.errors.create({
                    data: {
                        id: this.db.cornflake.generate(),
                        state: params.opts.state,
                        type: params.opts.type,
                        status: params.opts.status,
                        message: params.message,
                        reporter: params.opts.reporter,
                        error_obj: params.opts.error_obj as any,
                    }
                }).catch((err: Error) => {
                    this.logs.error(`Error creating Snaily report: ${err.message}`);
                    this.logs.debug(err.stack as string);

                    return { success: false, message: err.message }
                })

                return {
                    success: true,
                    message: 'Error Report created successfully',
                    data: err
                }
            },
            throw: async (params: Throw): Promise<Snaily> => {
                const error = new Error(params.message) as Snaily;

                error.state = params.opts.state;
                error.type = params.opts.type;
                error.status = params.opts.status;
                error.message = params.opts.message;
                error.reporter = params.opts.reporter;
                error.error_obj = params.opts.error_obj;

                await this.error.create({
                    message: error.message,
                    opts: {
                        state: error.state,
                        type: error.type,
                        status: error.status,
                        message: error.message,
                        reporter: error.reporter,
                        error_obj: error.error_obj
                    }
                });


                await this.error.webhook({
                    id: params.opts.id as string,
                    state: params.opts.state,
                    type: params.opts.type,
                    status: params.opts.status,
                    reporter: params.opts.reporter,
                    message: params.opts.message
                })

                throw error;
            },
            webhook: async (params: WebhookParams): Promise<void> => {
                try {
                    return await axios.post(`https://proxy.cordx.lol/api/webhooks/${process.env.HookChannel}/${process.env.HookToken}`, {
                        content: `A new error/diagnostics report has been generated!`,
                        embeds: [{
                            title: "Snaily: error logger",
                            description: `You can view this report using the: \`\`/snaily\`\` command.`,
                            color: 0xff0000,
                            fields: [{
                                name: 'ID',
                                value: `${params.id}`,
                                inline: true
                            }, {
                                name: 'State',
                                value: `${params.state}`,
                                inline: true
                            }, {
                                name: 'Type',
                                value: `${params.type}`,
                                inline: true
                            }, {
                                name: 'Status',
                                value: `${params.status}`,
                                inline: true
                            }, {
                                name: 'Reporter',
                                value: `${params.reporter}`,
                                inline: true
                            }, {
                                name: 'Message',
                                value: `${params.message}`,
                                inline: false
                            }],
                            thumbnail: {
                                url: 'https://cdn.cordx.space/assets/logo-trans-white.png'
                            },
                            image: {
                                url: 'https://cdn.cordx.space/assets/err-logs-banner.gif'
                            },
                            footer: {
                                text: '© 2024 - Infinity Development',
                                icon_url: 'https://cdn.cordx.space/assets/logo-trans-white.png'
                            }
                        }]
                    }, { headers: { Authorization: process.env.PROXY_TOKEN } });
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        this.logs.error(`Error sending snaily logs: ${err.message}`);
                        this.logs.debug(err.stack as string);
                    }
                }
            }
        }
    }
}
