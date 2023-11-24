const { configCheck } = require("@functions/configCheck");
const { websiteMonitor } = require("@plugins/monitors/index");

module.exports = {
  name: "ready",
  once: true,

  async execute(client) {
    await configCheck({ client: client });

    await client.logger("Connecting to the discord api...", {
      header: "CLIENT_START",
      type: "start",
    });

    try {
      await client.utils.setClientPresence(client);

      /**
       * MONITORS HERE
       */
      await websiteMonitor({
        client: client,
        domain: "https://cordx.lol",
        interval: 900000,
        retries: 3,
        logChannelId: "1148416632079777802",
      });

      await websiteMonitor({
        client: client,
        domain: "https://beta.cordx.lol",
        interval: 900000,
        retries: 3,
        logChannelId: "1148439450569953280",
      });

      await websiteMonitor({
        client: client,
        domain: "https://api.cordx.lol",
        interval: 900000,
        retries: 3,
        logChannelId: "1148439680099037184",
      });

      return client.logger("Connected to the discord api!", {
        header: "CLIENT_START",
        type: "ready",
      });
    } catch (e) {
      return client.logger(`${e.stack}`, {
        header: "CONNECTION_FAILURE",
        type: "error",
      });
    }
  },
};
