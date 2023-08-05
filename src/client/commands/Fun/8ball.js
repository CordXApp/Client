module.exports = {
    name: "8ball",
    category: "Fun",
    description: "Ask the magic 8ball a question",
    userPerms: [""],
    basePerms: [""],
    options: [{
        name: "question",
        description: "What you want to ask the 8ball",
        required: true,
        type: 3,
    }, ],

    run: async(client) => {
        let q = await client.interaction.options.getString("question");

        let r = [
            // Standard Responses
            "It is certain.",
            "Without a doubt.",
            "Yes, definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful.",

            // Custom Responses
            "Let me ponder on that for a moment...",
            "The cosmic energy is a bit cloudy right now.",
            "I sense a disturbance in the 8Ball force...",
            "The answer is hiding within the 8Ball matrix.",

            // Funny Responses
            "Error 404: Answer not found.",
            "Sorry, I was daydreaming. What was your question?",
            "My crystal ball is on vacation.",
            "I'm on a lunch break, ask again later.",

            // Hidden Easter Egg Responses
            "🕵️‍♂️ That's classified information.",
            "I could tell you, but then I'd have to shake you.",
            "The answer is classified as a state secret.",
            "I'm feeling a bit mischievous. Ask again?",
            "Magic 8Ball.exe has stopped working.",
        ];

        return client.interaction.reply({
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle("Magic 8Ball")
                .setColor(client.color)
                .setThumbnail(client.ballLogo)
                .setDescription("Here are your results")
                .addFields({
                    name: "You asked",
                    value: `${q}`,
                    inline: false,
                }, {
                    name: "8Ball says",
                    value: `${r[Math.floor(Math.random() * r.length)]}`,
                    inline: false,
                }, )
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo,
                }),
            ],
        });
    },
};