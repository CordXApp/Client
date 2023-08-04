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

    let r = [
      "It is certain.",
      "No doubt about it.",
      "No chance.",
      "Maybe, only time will tell.",
      "No way.",
      "Concentrate and try again.",
      "As I see it, yes",
      "Outlook good",
      "Most likely",
      "Better not tell you now",
      "My sources say yes",
      "Signs point to yes",
      "Yes definitely",
      "It is decidedly so",
      "As I see it, no",
      "My sources say no",
      "Outlook not so good",
      "Very doubtful",
    ];

    return client.interaction.reply({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle("Magic 8Ball")
          .setColor(client.color)
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
              value: `${r[Math.floor(Math.random() * r.length)]}`,
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
