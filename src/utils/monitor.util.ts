import { UptimeClient } from "@infinitylist/uptime"
import type CordX from "../client/cordx"
import Logger from "./logger.util"

export class UptimeMonitor {
    public logs: Logger
    public client: CordX
    public uptime: UptimeClient
    public options: {
        interval: number
        retries: number
        url: string
        logs: string
    }

    constructor(
        client: CordX,
        options: {
            interval: number
            retries: number
            url: string
            logs: string
        },
    ) {
        if (!options)
            throw new Error("No options were provided for the uptime monitor.")
        if (!options.url)
            throw new Error("No url was provided for the uptime monitor.")
        if (!options.logs)
            throw new Error(
                "No log channel was provided for the uptime monitor!",
            )
        if (!options.interval) options.interval = 60000
        if (!options.retries) options.retries = 3

        this.options = options
        this.logs = new Logger("Uptime Monitor")
        this.client = client

        this.uptime = new UptimeClient(options.url, {
            interval: options.interval,
            retries: options.retries,
        })
    }

    public async start(): Promise<void> {
        await this.uptime._start()

        this.uptime.on("up", async (up) => {
            const channel: any = await this.client.channels.cache.find(
                (c) => c.id === this.options.logs,
            )

            if (!channel) return

            function dhms(t: number) {
                let days = Math.floor(t / (1000 * 60 * 60 * 24))
                let hours = Math.floor(
                    (t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                )
                let minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))
                let seconds = Math.floor((t % (1000 * 60)) / 1000)

                return `${days}d ${hours}h ${minutes}m ${seconds}s`
            }

            await channel.send({
                embeds: [
                    new this.client.Embeds({
                        title: "Status of: " + this.uptime.infos.url,
                        color: this.client.config.EmbedColors.success,
                        description: `**UP for:** ${dhms(up.uptime)}`,
                        fields: [
                            {
                                name: "Status",
                                value: "🟢 Online",
                                inline: false,
                            },
                            {
                                name: "Failures",
                                value: `${up?.failures ? up?.failures : 0}`,
                                inline: false,
                            },
                            {
                                name: "Ping",
                                value: `${up?.ping ? up?.ping : 0}ms`,
                                inline: false,
                            },
                        ],
                    }),
                ],
            })
        })

        this.uptime.on("outage", async (outage) => {
            const channel: any = await this.client.channels.cache.find(
                (c) => c.id === this.options.logs,
            )

            if (!channel) return

            await channel.send({
                embeds: [
                    new this.client.Embeds({
                        title: "Status of: " + this.uptime.infos.url,
                        color: this.client.config.EmbedColors.error,
                        description: `Whoops, looks like ${this.uptime.infos.url} is down!`,
                        fields: [
                            {
                                name: "Status",
                                value: "🔴 Offline",
                                inline: false,
                            },
                            {
                                name: "Code",
                                value: outage.statusCode,
                                inline: false,
                            },
                            {
                                name: "Message",
                                value: outage.statusText,
                            },
                        ],
                    }),
                ],
            })
        })

        this.uptime.on("error", async (error) => {
            await console.error(error.stack)

            const channel: any = await this.client.channels.cache.find(
                (c) => c.id === this.options.logs,
            )

            if (!channel) return

            await this.uptime._setInterval(0)
            await this.uptime._stop()

            await channel.send({
                embeds: [
                    new this.client.Embeds({
                        title: "Status of: " + this.uptime.infos.url,
                        color: this.client.config.EmbedColors.error,
                        description: `Something went wrong here, the monitor will be stopped now.`,
                        fields: [
                            {
                                name: "Error",
                                value: error.message,
                                inline: false,
                            },
                        ],
                    }),
                ],
            })
        })
    }
}
