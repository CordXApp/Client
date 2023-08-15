const package = require("../../../../package.json");

module.exports = {
  name: "info",
  category: "Info",
  description: "Some information about me!",
  userPerms: [""],
  basePerms: [""],

  run: async (client) => {
    return client.interaction.reply({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle("Bot Information")
          .setColor(client.colors.base)
          .setDescription("Why do you care?")
          .addFields(
            {
              name: "Bot Version",
              value: `v${package.version}`,
              inline: false,
            },
            {
              name: "Bot Creator",
              value: `${package.author}`,
              inline: false,
            },
            {
              name: "Made With",
              value: `Discord.js v${require("discord.js").version}`,
              inline: false,
            },
          )
          .setTimestamp()
          .setFooter({
            text: client.footer,
            iconURL: client.logo,
          }),
      ],
    });
  },
};
