import Discord, { ActivityType } from "discord.js"
import EventBase from "../../../schemas/Event.schema"
import { UptimeMonitor } from "../../../utils/Monitors"
import type CordX from "../../CordX"

export default class Ready extends EventBase {
    constructor() {
        super({ name: "ready", once: true })
    }

    public async execute(client: CordX) {
        client.restApi.registerSlashCommands()
        client.restApi.registerPrivateCommands()
        await client.db.init();

        await client.db.monitorDomains();

        client.logs.info(`Logged in as ${client.user?.tag}!`)

        let cordx = client.guilds.cache.get('871204257649557604');

        if (!cordx) return client.logs.error('Failed to fetch guild!');

        let owner = '871275330424426546';
        let admin = '871275518794801193';
        let moderator = '1136100365243260959';
        let support = '1138246343412953218';
        let developer = '871275407134040064';
        let beta = '871275619336474664';

        let members = await cordx?.members.fetch();

        if (!members) return client.logs.error('Failed to fetch members!');

        setInterval(async () => {

            client.logs.info(`Automation: verifying guild users have the correct roles and positions in our system`);

            for (const member of members.values()) {
                if (member.user.bot) continue;
                if (member.roles.cache.has(owner)) await client.db.addGuildRoles(member.id, 'owner').catch((err) => client.logs.error(err.message));
                if (member.roles.cache.has(admin)) await client.db.addGuildRoles(member.id, 'admin').catch((err) => client.logs.error(err.message));
                if (member.roles.cache.has(moderator)) await client.db.addGuildRoles(member.id, 'moderator').catch((err) => client.logs.error(err.message));
                if (member.roles.cache.has(support)) await client.db.addGuildRoles(member.id, 'support').catch((err) => client.logs.error(err.message));
                if (member.roles.cache.has(developer)) await client.db.addGuildRoles(member.id, 'developer').catch((err) => client.logs.error(err.message));
                if (member.roles.cache.has(beta)) await client.db.addGuildRoles(member.id, 'beta').catch((err) => client.logs.error(err.message));

                if (!member.roles.cache.has(owner)) await client.db.removeGuildRoles(member.id, 'owner').catch((err) => client.logs.error(err.message));
                if (!member.roles.cache.has(admin)) await client.db.removeGuildRoles(member.id, 'admin').catch((err) => client.logs.error(err.message));
                if (!member.roles.cache.has(moderator)) await client.db.removeGuildRoles(member.id, 'moderator').catch((err) => client.logs.error(err.message));
                if (!member.roles.cache.has(support)) await client.db.removeGuildRoles(member.id, 'support').catch((err) => client.logs.error(err.message));
                if (!member.roles.cache.has(developer)) await client.db.removeGuildRoles(member.id, 'developer').catch((err) => client.logs.error(err.message));
                if (!member.roles.cache.has(beta)) await client.db.removeGuildRoles(member.id, 'beta').catch((err) => client.logs.error(err.message));

                await client.db.verifyUserModel(member.id).catch((err) => client.logs.error(err.message));
            }

            client.logs.ready(`Automation: verification complete.`);
        }, 3 * 60 * 60 * 1000) // runs every 3 hours

        await client.db.correctIdentifiers();

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

        await new UptimeMonitor(client, {
            url: "https://cordx.lol",
            logs: "1148416632079777802",
            interval: 900000,
            retries: 3,
        }).start()

        await new UptimeMonitor(client, {
            url: "https://api.cordx.lol",
            logs: "1148439680099037184",
            interval: 900000,
            retries: 3,
        }).start()

        await new UptimeMonitor(client, {
            url: "https://help.cordx.lol",
            logs: "1148439450569953280",
            interval: 900000,
            retries: 3,
        }).start()

        await new UptimeMonitor(client, {
            url: "https://proxy.cordx.lol",
            logs: "1148439450569953280",
            interval: 900000,
            retries: 3,
        }).start()
    }
}
