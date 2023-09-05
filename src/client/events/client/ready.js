const { configCheck } = require("@functions/configCheck");
const { startProdSiteMonitor } = require("@plugins/monitors/cordx.lol");

module.exports = {
  name: "ready",
  once: true,

  async execute(client) {
    await configCheck({ client: client });
    const ticketInit = client.channels.cache.get(
      client.config.Tickets.ticketChan,
    );

    await client.logger("Connecting to the discord api...", {
      header: "CLIENT_START",
      type: "start",
    });

    try {
      await client.utils.setClientPresence(client);

      await startProdSiteMonitor({ client: client });

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
