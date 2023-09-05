const { ActivityType } = require("discord.js");

module.exports.setClientPresence = async (client, presence) => {
  /**
   * THE CLIENT PRESENCES
   * @define - name -  The name of the presence
   * @define - type - The type of presence (playing, watching, streaming or listening)
   * @define - url - The url for the presence (if streaming) if not set leave blank with ""
   */
  let presences = [
    {
      name: "Playing with your images",
      type: ActivityType.Custom,
    },
    {
      name: "https://dev.cordx.lol",
      type: ActivityType.Custom,
    },
    {
      name: "https://cordx.lol",
      type: ActivityType.Custom,
    },
    {
      name: "https://docs.cordx.lol",
      type: ActivityType.Custom,
    },
    {
      name: "https://cordx.instatus.com",
      type: ActivityType.Custom,
    },
  ];

  /**
   * SET THE CLIENT STATUS
   * @type idle
   * @type online
   * @type dnd
   * @type invisible
   */
  client.user.setStatus("idle");

  setInterval(function () {
    let presence = presences[Math.floor(Math.random() * presences.length)];

    client.user.setActivity({
      name: presence.name,
      type: presence.type,
    });
  }, 10000);
};
