import { ActivityType } from "discord.js"
import EventBase from "../../../schemas/event.schema"
import type CordX from "../../cordx"

export default class Ready extends EventBase {
    constructor() {
        super({ name: "ready", once: true })
    }

    public async execute(client: CordX) {
        client.restApi.registerSlashCommands()
        client.restApi.registerPrivateCommands()

        client.logs.info(`Logged in as ${client.user?.tag}!`)

        const uploads = await client.db.prisma.images.count();
        const orgs = await client.db.prisma.orgs.count();
        const users = await client.db.prisma.users.count();

        client.server.start().catch((err: Error) => {
            client.logs.error(err.stack as string);
        });

        let presences = [
            {
                name: 'cordximg.host',
                type: ActivityType.Watching
            },
            {
                name: `Helping: ${users} users`,
                type: ActivityType.Custom
            },
            {
                name: `Serving: ${uploads} files`,
                type: ActivityType.Custom,
            },
            {
                name: `Moderating: ${orgs} orgs`,
                type: ActivityType.Custom
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

        //await client.db.user.model.syncRoles();
        //await client.db.user.model.syncPerms();

        setInterval(async () => {
            await client.db.domain.model.wipeUnverified();
        }, 30000)
    }
}
