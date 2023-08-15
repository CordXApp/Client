const responses = require("@json/8ball");

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

    return client.interaction.reply({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle("Magic 8Ball")
          .setColor(client.colors.base)
          .setThumbnail(client.ballLogo)
          .setDescription("Here are your results")
          .addFields(
            {
              name: "You asked",
              value: `${q}`,
              inline: false,
            },
            {
              name: "8Ball says",
              value: `${
                responses[Math.floor(Math.random() * responses.length)]
              }`,
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
