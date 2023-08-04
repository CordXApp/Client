const { sqlConnection } = require("@functions/sqlConnection");

module.exports = {
  name: "profile",
  category: "Sharex",
  description: "View your cordx profile/information",
  userPerms: [""],
  basePerms: [""],

  run: async (client) => {
    let sql = await sqlConnection({
      host: client.config.Database.host,
      user: client.config.Database.user,
      pass: client.config.Database.pass,
      name: client.config.Database.name,
    });

    let username = client.interaction.user.globalName
      ? client.interaction.user.globalName
      : client.interaction.user.username;

    await sql.query(
      `SELECT * FROM users WHERE folder="${client.interaction.user.id}"`,
      async (err, row) => {
        if (err)
          return client.interaction.reply({
            embeds: [
              new client.Gateway.EmbedBuilder()
                .setTitle("ERROR: Database Query Failed")
                .setColor(client.color)
                .setThumbnail(client.logo)
                .setDescription(
                  "Whoops, something went wrong with the Database Query",
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
            ephemeral: true,
          });

        let user = row[0];

        await sql.query(
          `SELECT * FROM images WHERE userid="${client.interaction.user.id}"`,
          async (err, row) => {
            if (err)
              return client.interaction.reply({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("ERROR: Database Query Failed")
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription(
                      "Whoops, something went wrong with the Database Query",
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
                ephemeral: true,
              });

            let images = row.length || 0;

            await sql.query(
              `SELECT * FROM downloads WHERE user="${client.interaction.user.id}"`,
              async (err, row) => {
                if (err)
                  return client.interaction.reply({
                    embeds: [
                      new client.Gateway.EmbedBuilder()
                        .setTitle("ERROR: Database Query Failed")
                        .setColor(client.color)
                        .setThumbnail(client.logo)
                        .setDescription(
                          "Whoops, something went wrong with the Database Query",
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
                    ephemeral: true,
                  });

                let downloads = row.length || 0;

                return client.interaction.reply({
                  embeds: [
                    new client.Gateway.EmbedBuilder()
                      .setTitle(`${username}'s Profile`)
                      .setColor(client.color)
                      .setThumbnail(
                        client.interaction.user.avatarURL({ dynamic: true }),
                      )
                      .setDescription(
                        "NOTE: This only includes public information",
                      )
                      .addFields(
                        {
                          name: "Profile",
                          value: `[View Profile](https://dev.cordx.lol/${user.userid})`,
                          inline: false,
                        },
                        {
                          name: "Secret",
                          value: "Use the ``/secret`` command to view",
                          inline: false,
                        },
                        {
                          name: "Cookie",
                          value: "Use the ``/cookie`` command to view",
                          inline: false,
                        },
                        {
                          name: "Webhook",
                          value: "Use the ``/webhook`` command to view",
                          inline: false,
                        },
                        {
                          name: "Images",
                          value: `${images} total`,
                          inline: false,
                        },
                        {
                          name: "Downloads",
                          value: `${downloads} total`,
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
            );
          },
        );
      },
    );
  },
};
