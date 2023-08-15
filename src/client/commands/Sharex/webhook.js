module.exports = {
  name: "webhook",
  category: "Sharex",
  description: "View your assigned upload webhook",
  userPerms: [""],
  basePerms: [""],
  options: [
    {
      name: "method",
      description: "How would you like it sent?",
      required: true,
      choices: [
        {
          name: "dm",
          value: "direct_message",
        },
        {
          name: "ephemeral",
          value: "private_message",
        },
      ],
      type: 3,
    },
  ],

  run: async (client) => {
    let method = await client.interaction.options.get("method")?.value;

    switch (method) {
      case "private_message":
        await fetch(
          `${client.config.API.domain}users/profile/${client.interaction.user.id}/${client.config.API.secret}`,
        )
          .then((res) => res.json())
          .then((user) => {
            return client.interaction.reply({
              ephemeral: true,
              embeds: [
                new client.Gateway.EmbedBuilder()
                  .setTitle("Action: view webhook")
                  .setColor(client.colors.base)
                  .setThumbnail(client.logo)
                  .setDescription(
                    "Here is your webhook. Please make sure you do not share it",
                  )
                  .addFields({
                    name: "Your Webhook",
                    value: `${user.webhook}`,
                    inline: false,
                  })
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
                  .setTitle("Error: unable to fetch")
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
                      name: "Our Status",
                      value: `[view status](https://beta.cordx.lol/status) or run the "/status" command.`,
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

      case "direct_message":
        await fetch(
          `${client.config.API.domain}users/profile/${client.interaction.user.id}/${client.config.API.secret}`,
        )
          .then((res) => res.json())
          .then(async (user) => {
            await client.interaction.user
              .send({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("Action: view webhook")
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription(
                      "Here is your webhook. Please make sure you do not share it",
                    )
                    .addFields({
                      name: "Your Webhook",
                      value: `${user.webhook}`,
                      inline: false,
                    })
                    .setTimestamp()
                    .setFooter({
                      text: client.footer,
                      iconURL: client.logo,
                    }),
                ],
              })
              .then(() => {
                return client.interaction.reply({
                  embeds: [
                    new client.Gateway.EmbedBuilder()
                      .setTitle("Success: message sent")
                      .setColor(client.colors.base)
                      .setThumbnail(client.logo)
                      .setDescription(
                        "I have sent your webhook to you, please check your DM's",
                      )
                      .setTimestamp()
                      .setFooter({
                        text: client.footer,
                        iconURL: client.logo,
                      }),
                  ],
                });
              })
              .catch(() => {
                return client.interaction.reply({
                  embeds: [
                    new client.Gateway.EmbedBuilder()
                      .setTitle("Error: message failed")
                      .setColor(client.colors.error)
                      .setThumbnail(client.logo)
                      .setDescription(
                        'Whoops, i was unable to send you a direct message, please make sure you are allowing DM\'s from server members or run the command again using the "ephemeral" params to send it in a private message',
                      )
                      .setTimestamp()
                      .setFooter({
                        text: client.footer,
                        iconURL: client.logo,
                      }),
                  ],
                });
              });
          })
          .catch(async (e) => {
            await client.logger(`${e.stack}`, {
              header: "COOKIE_FETCH",
              type: "error",
            });

            return client.interaction.reply({
              embeds: [
                new client.Gateway.EmbedBuilder()
                  .setTitle("Error: unable to fetch")
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
                      name: "Our Status",
                      value: `[view status](https://beta.cordx.lol/status) or run the "/status" command.`,
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
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Error: invalid params")
              .setColor(client.colors.base)
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
