import { Collection } from "discord.js"
import { Responses } from "../types/database/index";
import { CordXSnowflake } from "@cordxapp/snowflake";
import { Cooldown } from "../types/client/index";
import type CordX from "../client/cordx"
import Logger from "./logger.util"
import axios from "axios";

export class Utilities {
    public client: CordX
    public logs: Logger;

    constructor(client: CordX) {
        this.client = client
        this.logs = new Logger('[HELPER]')
    }

    public get base() {
        return {
            delay: (ms: number) => {
                return new Promise(resolve => setTimeout(resolve, ms))
            },
            isUrl: (domain: string): boolean => {
                const url = new URL(domain);
                if (!url) return false
                return true
            },
            cooldown: async ({ ms, command, user }: Cooldown): Promise<void | string> => {
                if (!this.client.cooldown.has(command)) {
                    this.client.cooldown.set(command, new Collection());
                }

                const now = Date.now();
                const timestamp = this.client.cooldown.get(command);
                const timeout = ms * 1000;

                if (timestamp?.has(user)) {
                    const cooldown = timestamp.get(user);

                    if (cooldown) {
                        const expires = cooldown + timeout;

                        if (now < expires) {
                            const remains = (expires - now) / 1000;

                            return `Whoops, you better slow down chief! Please wait: ${remains}`;
                        }
                    }
                }

                timestamp?.set(user, now);

                setTimeout(() => timestamp?.delete(user), timeout);
            },
            update_msg: async (msg: string, interaction: any): Promise<void> => {
                while (true) {
                    interaction.editReply({
                        embeds: [
                            new this.client.EmbedBuilder({
                                title: 'Update: still working on it',
                                description: msg as string,
                                color: this.client.config.EmbedColors.warning,
                                thumbnail: this.client.config.Icons.loading
                            })
                        ],
                        components: []
                    })

                    await this.base.delay(10000);
                }
            },
            /**
             * Generate a new Snowflake Style ID for CordX Reports
             * @returns {string} - Snowflake ID
             */
            createReportId: async (): Promise<string> => {
                this.logs.info(`Generating a new report ID....`);

                const snowflake = new CordXSnowflake({
                    workerId: 1,
                    processId: 1,
                    sequence: 5n,
                    increment: 1,
                    epoch: 1609459200000,
                    debug: false
                });

                const id = snowflake.generate();

                const exists = await this.client.db.prisma.reports.findUnique({ where: { id: id } });

                if (exists) {
                    this.logs.warn(`Report ID ${id} already exists, generating a new one...`);
                    return await this.base.createReportId();
                }

                this.logs.info(`Generated new report ID: ${id}`);

                return id;
            },
            purgeMessages: async (channel: string, amount: number, initialMessageID: string): Promise<Responses> => {

                let chan = this.client.channels.cache.get(channel);

                if (amount > 99 || amount <= 2) return { success: false, message: 'Amount of messages should be between 2 and 99' }
                if (!chan?.isTextBased()) return { success: false, message: 'Please provide a valid text channel' }
                if (!chan) return { success: false, message: 'Unable to locate the provided channel.' }

                let messages = (await chan.messages.fetch({ limit: amount })).filter((m: any) => m.createdAt.getTime() > Date.now() - 1209600000);

                messages = messages.filter((m: any) => m.id !== initialMessageID);
                messages = messages.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

                const length = messages.size;

                for (const message of messages.values()) {
                    await message.delete().catch(async (err: Error) => {
                        this.logs.error(`Failed to delete message: ${message.id} in channel: ${chan?.id} - ${err}`);
                        return { success: false, message: `Failed to delete message: ${message.id} - ${err.message}` }
                    })
                }

                return {
                    success: true, message: `Successfully purged ${length} messages from channel <#${chan.id}>, please wait while i cleanup the process!`
                }
            }
        }
    }

    public get format() {
        return {
            bytes: async (bytes: number, decimals = 2): Promise<string> => {
                if (bytes === 0) return "0 Bytes";

                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
            },
            units: async (bytes: any): Promise<number> => {

                if (!bytes) throw new Error('No bytes provided to convert to units');

                if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + 'GB' };
                if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + 'MB' };
                if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + 'KB' };
                if (bytes > 1) { bytes + ' bytes' };
                if (bytes == 1) { bytes + ' byte' };
                if (bytes == 0) { bytes = '0 bytes' };

                return bytes;
            },
            date: async (date: Date): Promise<string> => {
                let base = new Date(date);

                let options: any = {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }

                return base.toLocaleString("en-US", options);
            },
            uptime: async (ms: number) => {
                const sec = Math.floor((ms / 1000) % 60).toString()
                const min = Math.floor((ms / (1000 * 60)) % 60).toString()
                const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString()
                const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString()

                return {
                    days: days.padStart(1, "0"),
                    hours: hrs.padStart(2, "0"),
                    minutes: min.padStart(2, "0"),
                    seconds: sec.padStart(2, "0"),
                }
            },
            time: async (ms: number): Promise<string> => {
                const seconds = Math.floor(ms / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                const sec = seconds % 60;
                const min = minutes % 60;
                const hrs = hours % 24;

                return `${days} days, ${hrs} hours, ${min} minutes, and ${sec} seconds`;
            }
        }
    }

    public get github() {
        return {
            /**
             * Fetch the raw content from a GitHub Repository
             * @param {string} repo - Repository name
             * @param {string} branch - Branch name
             * @param {string} path - Path to the file (optional)
             * @returns {Responses} - Response object
             */
            raw: async (repo: string, branch: string, path: string): Promise<Responses> => {
                if (!repo) return { success: false, message: 'Please provide a valid repository' };
                if (!branch) return { success: false, message: 'Please provide a valid branch' };

                const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;

                const res = await axios.get(url, { headers: { Authorization: `token ${process.env.GH_TOKEN}` } }).then(res => res);

                if (res.status !== 200) return { success: false, message: `Failed to fetch data with error: ${res.statusText}` };

                return { success: true, data: res.data };
            },
            /**
             * Fetch the content from a GitHub Repository
             * @param {string} repo - Repository name
             * @param {string} branch - Branch name
             * @param {string} path - Path to the file (optional)
             * @returns {Responses} - Response object
             */
            request: async (repo: string, branch: string, path: string): Promise<Responses> => {
                if (!repo) return { success: false, message: 'Please provide a valid repository' };
                if (!branch) return { success: false, message: 'Please provide a valid branch' };

                const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

                const res = await axios.get(url, { headers: { Authorization: `token ${process.env.GH_TOKEN}` } }).then(res => res);

                if (res.status !== 200) return { success: false, message: `Failed to fetch data with error: ${res.statusText}` };

                return { success: true, data: res.data };
            },
            /**
             * Fetch the project version from the GitHub Repository
             * @param {string} repo - Repository name
             * @param {string} branch - Branch name
             * @param {string} path - Path to the file where the version is present
             * @returns {Responses} - Response object
             */
            version: async (repo: string, branch: string, path: string): Promise<void> => {
                if (!repo) throw new Error('Please provide a valid repository!');
                if (!branch) throw new Error('Please provide a valid branch!');
                if (!path) throw new Error('Please provide a valid path!');

                const repository = await this.github.raw(repo, branch, path);

                if (!repository.success) throw new Error(repository.message);

                return repository.data.version ? repository.data.version : 'Unavailable';
            }
        }
    }
}
