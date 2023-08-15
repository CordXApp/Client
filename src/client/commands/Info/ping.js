module.exports = {
  name: "ping",
  category: "Info",
  description: "API Latency and Response Time",
  userPerms: [""],
  basePerms: [""],

  run: async (client) => {
    return client.interaction.reply({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle("🏓 Ping - Pong")
          .setColor(client.colors.base)
          .setDescription("Is it bad?")
          .addFields(
            {
              name: "API Latency",
              value: `\`${Math.round(client.ws.ping)}ms\``,
              inline: true,
            },
            {
              name: "Response Time",
              value: `\`${
                Date.now() - client.interaction.createdTimestamp
              }ms\``,
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
  },
};
