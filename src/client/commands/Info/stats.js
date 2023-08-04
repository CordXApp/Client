const { sqlConnection } = require("@functions/sqlConnection");

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

    let sql = await sqlConnection({
      host: client.config.Database.host,
      user: client.config.Database.user,
      pass: client.config.Database.pass,
      name: client.config.Database.name,
    });

    if (method == "bot_stats") {
      return client.interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("Bot Statistics")
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription("Here is my statistics")
            .addFields(
              {
                name: "User Count",
                value: `${client.users.cache.size}`,
                inline: false,
              },
              {
                name: "Channel Count",
                value: `${client.channels.cache.size}`,
                inline: false,
              },
              {
                name: "Guild Count",
                value: `${client.guilds.cache.size}`,
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
    } else if (method == "website_stats") {
      await sql.query(`SELECT * FROM images`, async (err, row) => {
        if (err)
          return client.interaction.reply({
            embeds: [
              new client.Gateway.EmbedBuilder()
                .setTitle("ERROR: SQL Query Failed")
                .setColor(client.color)
                .setThumbnail(client.logo)
                .setDescription(
                  "Woah, something went wrong with the database query!",
                )
                .addFields({
                  name: "Error",
                  value: `${err.message}`,
                  inline: false,
                })
                .setTimestamp()
                .setFooter({
                  text: client.footer,
                  iconURL: client.logo,
                }),
            ],
          });

        let c = row.length || 0;

        await sql.query(`SELECT * FROM users`, async (err, row) => {
          if (err)
            return client.interaction.reply({
              embeds: [
                new client.Gateway.EmbedBuilder()
                  .setTitle("ERROR: SQL Query Failed")
                  .setColor(client.color)
                  .setThumbnail(client.logo)
                  .setDescription(
                    "Woah, something went wrong with the database query!",
                  )
                  .addFields({
                    name: "Error",
                    value: `${err.message}`,
                    inline: false,
                  })
                  .setTimestamp()
                  .setFooter({
                    text: client.footer,
                    iconURL: client.logo,
                  }),
              ],
            });

          let u = row.length || 0;

          await sql.query(`SELECT * FROM downloads`, async (err, row) => {
            if (err)
              return client.interaction.reply({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("ERROR: SQL Query Failed")
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription(
                      "Woah, something went wrong with the database query!",
                    )
                    .addFields({
                      name: "Error",
                      value: `${err.message}`,
                      inline: false,
                    })
                    .setTimestamp()
                    .setFooter({
                      text: client.footer,
                      iconURL: client.logo,
                    }),
                ],
              });

            let d = row.length || 0;

            return client.interaction.reply({
              embeds: [
                new client.Gateway.EmbedBuilder()
                  .setTitle("Website Statistics")
                  .setColor(client.color)
                  .setThumbnail(client.logo)
                  .setDescription(
                    "Our [website](https://dev.cordx.lol) statistics",
                  )
                  .addFields(
                    {
                      name: "Stored Images",
                      value: `${c} total`,
                      inline: true,
                    },
                    {
                      name: "Stored Downloads",
                      value: `${d} total`,
                      inline: false,
                    },
                    {
                      name: "Registered Users",
                      value: `${u} total`,
                    },
                  ),
              ],
            });
          });
        });
      });
    }
  },
};
