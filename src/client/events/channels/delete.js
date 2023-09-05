module.exports = {
  name: "channelDelete",

  async execute(channel, client) {
    let guild = await client.guilds.cache.get("871204257649557604");
    let logs = await guild.channels.cache.get("871275187377688628");

    if (channel.guild.id !== "871204257649557604") return;

    return logs.send({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle("🗑️ Channel deleted")
          .setColor(client.colors.base)
          .setThumbnail(client.logo)
          .setDescription("Someone has deleted a channel!")
          .addFields(
            {
              name: "Channel Name",
              value: `${channel.name}`,
              inline: true,
            },
            {
              name: "Channel ID",
              value: `${channel.id}`,
              inline: true,
            },
            {
              name: "Channel Type",
              value: `${channel.type}`,
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
