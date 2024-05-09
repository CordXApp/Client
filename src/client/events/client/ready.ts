import { ActivityType } from "discord.js"
import EventBase from "../../../schemas/Event.schema"
import type CordX from "../../CordX"

export default class Ready extends EventBase {
    constructor() {
        super({ name: "ready", once: true })
    }

    public async execute(client: CordX) {
        client.restApi.registerSlashCommands()
        client.restApi.registerPrivateCommands()

        client.logs.info(`Logged in as ${client.user?.tag}!`)

        client.server.start().catch((err: Error) => {
            client.logs.error(err.stack as string);
        });

        let presences = [
            {
                name: "Playing with your images",
                type: ActivityType.Custom,
            },
            {
                name: "https://cordximg.host",
                type: ActivityType.Custom,
            },
            {
                name: "https://help.cordx.lol",
                type: ActivityType.Custom,
            },
            {
                name: "https://status.cordx.lol",
                type: ActivityType.Custom,
            },
        ]

        client?.user?.setStatus("idle")

        setInterval(() => {
            let presence: any =
                presences[Math.floor(Math.random() * presences.length)]

            client?.user?.setActivity({
                name: presence.name,
                type: presence.type,
            })
        }, 10000)
    }
}
