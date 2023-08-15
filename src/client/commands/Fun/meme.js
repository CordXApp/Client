module.exports = {
    name: 'meme',
    category: 'Fun',
    description: 'Generate a meme',
    userPerms: [''],
    basePerms: [''],
    options: [
        {
            name: 'topic',
            description: 'The category/topic of meme',
            required: true,
            type: 3,
            choices: [
                {
                    name: 'Random Meme',
                    value: 'memes'
                },
                {
                    name: 'Dank Memes',
                    value: 'dank'
                },
                {
                    name: 'The Dankest Memes',
                    value: 'danker'
                },
                {
                    name: 'Prequel Memes',
                    value: 'prequel'
                },
                {
                    name: 'Facebook Memes',
                    value: 'facebook'
                },
                {
                    name: 'Wholesome Memes',
                    value: `wholesome`
                },
                {
                    name: 'Surreal Memes',
                    value: `surreal`
                },
                {
                    name: 'Funny Memes',
                    value: `funny`
                },
                {
                    name: 'Meme Economy',
                    value: 'economy'
                },
                {
                    name: 'Cat Memes',
                    value: 'cats'
                },
                {
                    name: 'Dog Memes',
                    value: 'dogs'
                }
            ]
        }
    ],

    run: async (client) => {

        let topic = await client.interaction.options.get('topic')?.value;

        await fetch(`${client.config.API.domain}client/memes/${topic}`)
        .then(res => res.json())
        .then(meme => {
            
            if (meme.nsfw) return client.interaction.reply({
                embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('Error: meme blocked')
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription('Whoops, we caught a bad one chief. Run the command again to continue!')
                    .addFields({
                        name: 'Error',
                        value: 'Our system detected that this meme is nsfw/nsfl (not safe for work/not safe for life) and has blocked it as a security measure',
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ]
            })

                return client.interaction.reply({
                    embeds: [
                        new client.Gateway.EmbedBuilder()
                        .setTitle(`${meme.title}`)
                        .setAuthor({ 
                            name: 'Meme Generator',
                            iconURL: client.logo,
                            url: `${client.config.API.domain}client/memes`
                        })
                        .setColor(client.colors.base)
                        .setThumbnail(client.logo)
                        .setImage(meme.image)
                        .setURL(meme.link)
                        .addFields({
                            name: '👨‍💻 Author',
                            value: `• ${meme.author}`,
                            inline: true
                        },{
                            name: '👍 Upvotes',
                            value: `• ${meme.upvotes}`,
                            inline: true
                        },{
                            name: '💬 Comments',
                            value: `• ${meme.comments}`,
                            inline: true
                        })
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