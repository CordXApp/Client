module.exports = {
  name: "8ball",
  category: "Fun",
  description: "Ask the magic 8ball a question",
  userPerms: [""],
  basePerms: [""],
  options: [
    {
      name: "question",
      description: "What you want to ask the 8ball",
      required: true,
      type: 3,
    },
  ],

  run: async (client) => {
    let q = await client.interaction.options.getString("question");

    await fetch(`${client.config.API.domain}client/8ball`)
      .then((res) => res.json())
      .then((data) => {
        return client.interaction.reply({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Magic 8Ball")
              .setColor(client.colors.base)
              .setThumbnail(client.ballLogo)
              .setDescription("Here are your results")
              .addFields(
                {
                  name: "You Asked",
                  value: `${q}`,
                  inline: false,
                },
                {
                  name: "8Ball Says",
                  value: `${data.response}`,
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
      })
      .catch(async (e) => {
        await client.logger(`Error: ${e.stack}`, {
          header: "ADVICE_API_ERROR",
          type: "error",
        });

        return client.interaction.reply({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Error: unable to fetch")
              .setColor(client.colors.error)
              .setThumbnail(client.logo)
              .setDescription(
                "Whoops, looks like i am unable to contact the api",
              )
              .addFields({
                name: "Error",
                value: `${e.message}`,
                inline: false,
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
