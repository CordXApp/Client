import { ActivityType } from "discord.js";
import EventBase from "../../schemas/Event.schema";
import { UptimeMonitor } from "../../utils/Monitors";
import type CordX from "../../client/CordX";

export default class Ready extends EventBase {
    
    constructor() {
        super({ name: 'ready', once: true })
    }

    public async execute(client: CordX) {

        client.restApi.registerSlashCommands();
        client.restApi.registerPrivateCommands();

        client.logs.info(`Logged in as ${client.user?.tag}!`);

        let presences = [{
            name: "Playing with your images",
            type: ActivityType.Custom,
          },
          {
            name: "https://cordx.lol",
            type: ActivityType.Custom,
          },
          {
            name: "https://help.cordx.lol",
            type: ActivityType.Custom,
          },
          {
            name: "https://status.cordx.lol",
            type: ActivityType.Custom,
        }]

        client?.user?.setStatus("idle");

        setInterval(() => {

            let presence: any = presences[Math.floor(Math.random() * presences.length)];
      
            client?.user?.setActivity({
              name: presence.name,
              type: presence.type
            });
          }, 10000)

          await new UptimeMonitor(client, {
            url: 'https://cordx.lol',
            logs: '1148416632079777802',
            interval: 900000,
            retries: 3,
          }).start();

          await new UptimeMonitor(client, {
            url: 'https://api.cordx.lol',
            logs: '1148439680099037184',
            interval: 900000,
            retries: 3,
          }).start();

          await new UptimeMonitor(client, {
            url: 'https://help.cordx.lol',
            logs: '1148439450569953280',
            interval: 900000,
            retries: 3,
          }).start();

          await new UptimeMonitor(client, {
            url: 'https://proxy.cordx.lol',
            logs: '1148439450569953280',
            interval: 900000,
            retries: 3,
          }).start();
    }
}