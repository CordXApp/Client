module.exports = {
  name: "profile",
  category: "Sharex",
  description: "View your cordx profile/information",
  userPerms: [""],
  basePerms: [""],
  options: [
    {
      name: "user",
      description: "Leave empty to fetch your own profile.",
      required: false,
      type: 6,
    },
  ],

  run: async (client) => {
    let member =
      (await client.interaction.options.getMember("user")) ||
      client.interaction.user;

    await fetch(
      `${client.config.Cordx.Domains.beta}api/user/stats?userId=${member.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        let remains = 2000 - data.used;
        let images = data.images;
        let downloads = data.downloads;
        let videos = data.videos;

        return client.interaction.reply({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle(
                `Profile for: ${
                  member.globalName ? member.globalName : member.user.globalName
                }`
              )
              .setColor(client.colors.base)
              .setThumbnail(member.displayAvatarURL({ dynamic: true }))
              .setDescription(
                `You can view the profile [here](https://dev.cordx.lol/${member.id})`
              )
              .addFields(
                {
                  name: "Stored Images",
                  value: `${images ? images : 0} total`,
                  inline: true,
                },
                {
                  name: "Stored Downloads",
                  value: `${downloads ? downloads : 0} total`,
                  inline: true,
                },
                {
                  name: "Stored Videos",
                  value: `${videos ? videos : 0} total`,
                  inline: true,
                },
                {
                  name: "Storage Limit",
                  value: `2,000MB`,
                  inline: true,
                },
                {
                  name: "Storage Used",
                  value: `${data.used.toLocaleString()}MB`,
                  inline: true,
                },
                {
                  name: "Storage Available",
                  value: `${remains.toLocaleString()}MB`,
                  inline: true,
                }
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
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Error: api unavailable")
              .setColor(client.colors.error)
              .setThumbnail(client.logo)
              .setDescription(
                "Hold up, either i was unable to locate your data or our API is down. Have you logged in or created an account? If you have you can check our status below"
              )
              .addFields(
                {
                  name: "Error",
                  value: `${e.message}`,
                  inline: true,
                },
                {
                  name: "View Our Status",
                  value: `[click me](https://beta.cordx.lol/status) or run the "/status" command.`,
                }
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
