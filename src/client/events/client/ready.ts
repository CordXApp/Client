import { ActivityType } from "discord.js"
import EventBase from "../../../schemas/event.schema"
import type CordX from "../../bruhh"

export default class Ready extends EventBase {
    constructor() {
        super({ name: "ready", once: true })
    }

    public async execute(client: CordX) {
        client.restApi.registerSlashCommands()
        client.restApi.registerPrivateCommands()

        client.logs.info(`Logged in as ${client.user?.tag}!`)

        const uploads = await client.db.prisma.images.count();

        client.server.start().catch((err: Error) => {
            client.logs.error(err.stack as string);
        });

        let presences = [
            {
                name: `${uploads} stored uploads `,
                type: ActivityType.Watching,
            }
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

        setInterval(async () => {
            await client.db.domain.model.wipeUnverified();
        }, 30000)
    }
}
