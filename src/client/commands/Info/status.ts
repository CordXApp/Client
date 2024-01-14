import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { SubCommandOptions } from "../../../types/utilities"
import { SlashBase } from "../../../schemas/Command.schema"
import { UptimeMonitor } from '../../../utils/Monitors'
import { UptimeClient } from "@infinitylist/uptime"
import type CordX from "../../CordX"

export default class Status extends SlashBase {
    constructor() {
        super({
            name: "status",
            description: "Check the current status of one of our services.",
            usage: "/status",
            example: "/status",
            category: "Info",
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'service',
                    description: 'The service you want to check the status of.',
                    required: true,
                    choices: [
                        {
                            name: 'Main Website',
                            value: 'https://cordx.lol',
                        },
                        {
                            name: 'Documentation',
                            value: 'https://help.cordx.lol'
                        }
                    ],
                    type: SubCommandOptions.String
                },
                {
                    name: 'autodelete',
                    description: 'Will delete the status message 5 seconds after it is sent.',
                    required: false,
                    type: SubCommandOptions.Boolean
                }
            ]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>,
    ): Promise<any> {

        const method = await interaction.options.getString('service');
        const uptime = new UptimeClient(`${method}`, { timeout: 5000 });

        await uptime._start();

        await interaction.reply({
            embeds: [
                new client.Embeds({
                    title: 'Fetching Status',
                    description: `Please wait while we fetch the status of the service you requested.`,
                    color : client.config.EmbedColors.base,
                    thumbnail: client.config.Icons.loading
                })
            ]
        })

        setTimeout(async () => {


            /**
             * @todo FIX THE UPTIME MODULE.
             * @body Usage of the "ts-expect-error" comment is not allowed
             * but is used here temporarily until the module is updated to
             * make these methods publicly accessible.
             */

            // @ts-expect-error
            const start = await new Date(uptime.startTime);
            // @ts-expect-error
            const end = await new Date(uptime.lastSuccessCheck);
            // @ts-expect-error
            const resTime = (end - start) / 1000;

            await uptime._stop();

            if (await interaction.options.getBoolean('autodelete')) {

                await interaction.editReply({
                    embeds: [
                        new client.Embeds({
                            title: `Website Status`,
                            description: 'Here is the status of the service you requested.',
                            color: client.config.EmbedColors.base,
                            fields: [
                                {
                                    name: 'Service',
                                    value: method,
                                    inline: true
                                },
                                {
                                    name: 'Status',
                                    value: uptime.available ? "🟢 ONLINE" : "🔴 OFFLINE",
                                    inline: true
                                },
                                {
                                    name: 'Check Started',
                                    value: `${start.toLocaleTimeString()}`,
                                    inline: true
                                },
                                {
                                    name: 'Check Ended',
                                    value: `${end.toLocaleTimeString()}`,
                                    inline: true
                                },
                                {
                                    name: 'Response Time',
                                    value: `${resTime} seconds`,
                                    inline: true
                                },
                                {
                                    name: 'Website Ping',
                                    value: uptime.ping ? `${uptime.ping}ms` : '0ms',
                                    inline: true
                                }
                            ]
                        })
                    ]
                })

                setTimeout(async () => {
                    await interaction.deleteReply()
                }, 5000)
            }

            return interaction.editReply({
                embeds: [
                    new client.Embeds({
                        title: `Website Status`,
                        description: 'Here is the status of the service you requested.',
                        color: client.config.EmbedColors.base,
                        fields: [
                            {
                                name: 'Service',
                                value: method,
                                inline: true
                            },
                            {
                                name: 'Status',
                                value: uptime.available ? "🟢 ONLINE" : "🔴 OFFLINE",
                                inline: true
                            },
                            {
                                name: 'Check Started',
                                value: `${start.toLocaleTimeString()}`,
                                inline: true
                            },
                            {
                                name: 'Check Ended',
                                value: `${end.toLocaleTimeString()}`,
                                inline: true
                            },
                            {
                                name: 'Response Time',
                                value: `${resTime} seconds`,
                                inline: true
                            },
                            {
                                name: 'Website Ping',
                                value: uptime.ping ? `${uptime.ping}ms` : '0ms',
                                inline: true
                            }
                        ]
                    })
                ]
            })

        }, 5000)
    }
}