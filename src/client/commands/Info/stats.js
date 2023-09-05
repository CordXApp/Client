module.exports = {
  name: "stats",
  category: "Info",
  description: "Bot or Website Statistics",
  userPerms: [""],
  basePerms: [""],
  options: [
    {
      name: "type",
      description: "Bot or Website Stats?",
      required: true,
      choices: [
        {
          name: "bot",
          value: "bot_stats",
        },
        {
          name: "website",
          value: "website_stats",
        },
      ],
      type: 3,
    },
  ],

  run: async (client) => {
    let method = await client.interaction.options.get("type")?.value;

    switch (method) {
      case "bot_stats":
        return client.interaction.reply({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Bot statistics")
              .setColor(client.colors.base)
              .setThumbnail(client.logo)
              .setDescription("Here are my stats chief!")
              .addFields(
                {
                  name: "User Count",
                  value: `${client.users.cache.size} users`,
                  inline: true,
                },
                {
                  name: "Channel Count",
                  value: `${client.channels.cache.size} channels`,
                  inline: true,
                },
                {
                  name: "Guild Count",
                  value: `${client.guilds.cache.size}`,
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

      case "website_stats":
        await fetch(`${client.config.API.domain}system/stats`)
          .then((res) => res.json())
          .then((stats) => {
            return client.interaction.reply({
              embeds: [
                new client.Gateway.EmbedBuilder()
                  .setTitle("Website statistics")
                  .setColor(client.colors.base)
                  .setThumbnail(client.logo)
                  .setDescription("Here is our website stats!")
                  .addFields(
                    {
                      name: "User Count",
                      value: `${stats.users} total users`,
                      inline: true,
                    },
                    {
                      name: "Stored Images",
                      value: `${stats.images} total images`,
                      inline: true,
                    },
                    {
                      name: "Download Count",
                      value: `${stats.downloads} total downloads`,
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
              embeds: [
                new client.Gateway.EmbedBuilder()
                  .setTitle("Error: api unavailable")
                  .setColor(client.colors.error)
                  .setThumbnail(client.logo)
                  .setDescription(
                    "Hold up, either i was unable to locate your data or our API is down. Have you logged in or created an account? If you have you can check our status below",
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

        break;

      default:
        return client.interaction.reply({
          ephemeral: true,
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Error: invalid params")
              .setColor(client.colors.error)
              .setThumbnail(client.logo)
              .setDescription("Please provide some valid command params")
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });
    }
  },
};
