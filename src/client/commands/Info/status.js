module.exports = {
  name: "status",
  category: "Info",
  description: "Check our system status",
  userPerms: [""],
  basePerms: [""],

  run: async (client) => {
    await fetch(`${client.config.API.domain}status/summary`)
      .then((res) => res.json())
      .then((sys) => {
        let status;

        if (sys.page.status === "UP") status = "OPERATIONAL";
        else if (sys.page.status === "HASISSUES")
          status = "EXPERIENCING DEGRADED PERFORMANCE";
        else if (sys.page.status === "UNDERMAINTENANCE")
          status = "UNDER ACTIVE MAINTENANCE";

        return client.interaction.reply({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("System status")
              .setColor(client.colors.base)
              .setThumbnail(client.logo)
              .setDescription(
                `All systems are: [${status}](https://beta.cordx.lol/status)`
              )
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });
      })
      .catch((e) => {
        return client.interaction.reply({
          ephemeral: true,
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Error: api unavailable")
              .setColor(client.colors.error)
              .setThumbnail(client.logo)
              .setDescription("Whoops, something went wrong with your request")
              .addFields({
                name: "Error",
                value: `${e.message}`,
                inline: true,
              })
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });
      });
  },
};
