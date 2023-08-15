module.exports = {
    name: 'yomomma',
    category: 'Fun',
    description: 'Generate a yomomma joke',
    userPerms: [''],
    basePerms: [''],

    run: async (client) => {

        await fetch(`${client.config.API.domain}client/yomomma`)
        .then(res => res.json())
        .then(data => {

            return client.interaction.reply({
                embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('YoMomma Memes')
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription(`${data.joke}`)
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ]
            })
        })
        .catch(async (e) => {

            await client.logger(`Error: ${e.stack}`, { header: 'ADVICE_API_ERROR', type: 'error' });


            return client.interaction.reply({
                embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('Error: unable to fetch')
                    .setColor(client.colors.error)
                    .setThumbnail(client.logo)
                    .setDescription('Whoops, looks like i am unable to contact the api')
                    .addFields({
                        name: 'Error',
                        value: `${e.message}`,
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ]
            })
        })
    }
}