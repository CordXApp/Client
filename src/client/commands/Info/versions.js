module.exports = {
  name: "versions",
  category: "Info",
  description: "View a list of all our system versions",
  userPerms: [""],
  basePerms: [""],

  run: async (client) => {
    await fetch(`${client.config.API.domain}system/check/versions`)
      .then((res) => res.json())
      .then((versions) => {
        let current = versions.current;
        let newest = versions.newest;
        let stable = versions.stable;

        return client.interaction.reply({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("System versions")
              .setColor(client.colors.base)
              .setThumbnail(client.logo)
              .setDescription(
                "Here is the current, newest and stable versions of our systems",
              )
              .addFields(
                {
                  name: "Current",
                  value: `• API: ${current.api}\n• Client: ${current.client}\n• Website: ${current.website}`,
                  inline: true,
                },
                {
                  name: "Newest",
                  value: `• API: ${newest.api}\n• Client: ${newest.client}\n• Website: ${newest.website}`,
                  inline: true,
                },
                {
                  name: "Stable",
                  value: `• API: ${stable.api}\n• Client: ${stable.client}\n• Website: ${stable.website}`,
                  inline: true,
                },
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
              .addFields(
                {
                  name: "Error",
                  value: `${e.message}`,
                  inline: true,
                },
                {
                  name: "View Our Status",
                  value: `[click me](https://beta.cordx.lol/status) or run the "/status" command.`,
                },
              )
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
