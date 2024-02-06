const { UptimeClient } = require("@infinitylist/uptime")
import { IStatusCommand } from "src/types/utilities";
import type CordX from "../client/CordX"
import Logger from "./Logger"

export class ClientUtils {
    public client: CordX
    public logs: Logger;

    constructor(client: CordX) {
        this.client = client
        this.logs = new Logger('ClientUtils')
    }

    public formatBytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    public formatDate(date: Date): string {
        let BaseDate = new Date(date)

        let options: any = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }

        return BaseDate.toLocaleString("en-US", options)
    }

    public formatUptime(ms: any) {
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
    }

    public formatTime(seconds: any): string {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)

        return `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""
            }${secs > 0 ? `${secs}s` : ""}`
    }

    public formatNumber(number: number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    public formatPercentage(current: number, max: number): string {
        return `${Math.floor((current / max) * 100)}%`
    }

    public formatNumberWithCommas(number: number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    public formatNumberWithK(number: number): string {
        return number > 999
            ? `${(number / 1000).toFixed(1)}k`
            : number.toString()
    }

    public formatNumberWithM(number: number): string {
        return number > 999999
            ? `${(number / 1000000).toFixed(1)}m`
            : number.toString()
    }

    public async purgeMessages(channel: string, amount: number): Promise<any> {

        let c: any = await this.client.channels.cache.get(channel);

        if (amount > 99 || amount <= 2) return { success: false, message: 'Amount should be less then 100 but greater then 2' }
        if (!c?.isTextBased()) return { success: false, message: 'Channel should be a text channel!' }
        if (!c) return { success: false, message: 'Channel was not found, did you provide the right ID?' }

        let messages = (await c.messages.fetch({ limit: amount })).filter((m: any) => m.createdAt.getTime() > Date.now() - 1209600000);
        messages = messages.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

        const length = await messages.size;

        for (const message of messages.values()) {

            await message.delete().catch(async (err: Error) => {
                await this.logs.error(`Failed to delete message ${message.id} in ${c?.id}!`)
                return { success: false, message: `Failed to delete message ${message.id} in ${c?.id}!` }
            });
        }

        return {
            success: true,
            message: `Successfully deleted \`${length}\` messages from the \`${c?.name}\` channel!`
        }
    }

    public async getServiceStatus(domain: string): Promise<IStatusCommand> {

        console.log(domain)

        const serviceClient = new UptimeClient(domain, {
            timeout: 5000,
        })

        await serviceClient._start();

        return new Promise(async (resolve) => {
            setTimeout(async () => {
                const start = new Date(serviceClient.startTime).getTime();
                const finish = new Date(serviceClient.lastSuccessCheck).getTime();
                const responseTime = (finish - start) / 1000;
                const available = serviceClient.available;
                const started = new Date(start).toLocaleString();
                const ended = new Date(finish).toLocaleString();
                const roundTrip = serviceClient.ping ? serviceClient.ping : 0;

                await serviceClient._stop();

                resolve({
                    success: true,
                    response: {
                        available: available,
                        started: started,
                        ended: ended,
                        responseTime: responseTime,
                        roundTrip: roundTrip,
                    }
                });
            }, 5000)
        });
    }

    public delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public isValidHttpUrl(domain: string): boolean {
        let url;

        try {
            url = new URL(domain);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }
}
