const { sqlConnection } = require('@functions/sqlConnection');

module.exports = {
    name: 'cookie',
    category: 'Sharex',
    description: 'View your cordx upload server cookie',
    userPerms: [''],
    basePerms: [''],
    options: [
        {
            name: 'method',
            description: 'How would you like it sent?',
            required: true,
            choices: [
                {
                    name: 'dm',
                    value: 'direct_message'
                },
                {
                    name: 'ephemeral',
                    value: 'private_message'
                }
            ],
            type: 3
        }
    ],

    run: async (client) => {
        let method = await client.interaction.options.get('method')?.value;

        let sql = await sqlConnection({
            host: client.config.Database.host,
            user: client.config.Database.user,
            pass: client.config.Database.pass,
            name: client.config.Database.name
        })

        if (method === 'direct_message') {

            await sql.query(`SELECT * FROM users WHERE folder="${client.interaction.user.id}"`, async (err, row) => {

                if (err) return client.interaction.reply({ embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('ERROR: Database Query Failed')
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription('Whoops, something went wrong with the Database Query')
                    .addFields({
                        name: 'Error',
                        value: `${err.message}`,
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ], ephemeral: true})

                if (!row[0]) return client.interaction.reply({ embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('ERROR: Query Not Found')
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription('Database query returned a 404 not found. Have you logged in/created an account?')
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ], ephemeral: true}) 

                await client.interaction.user.send({ embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('Action: View Cookie')
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription('Here is your cordx upload server cookie.')
                    .addFields({
                        name: 'Cookie',
                        value: `${row[0].cookie}`,
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    }) 
                ]}).then(() => {

                    return client.interaction.reply({ embeds: [
                        new client.Gateway.EmbedBuilder()
                        .setTitle('SUCCESS: DM Sent')
                        .setColor(client.color)
                        .setThumbnail(client.logo)
                        .setDescription('I have sent you your sharex secret via direct message')
                        .setTimestamp()
                        .setFooter({
                            text: client.footer,
                            iconURL: client.logo
                        })
                    ]})

                }).catch(() => {

                    return client.interaction.reply({ embeds: [
                        new client.Gateway.EmbedBuilder()
                        .setTitle('ERROR: Message Failed')
                        .setColor(client.color)
                        .setThumbnail(client.logo)
                        .setDescription('Failed to send your cookie via DMs. Please make sure you are allowing DMs from guild members or use the ephemeral method which will send it via a private message!')
                        .setTimestamp()
                        .setFooter({
                            text: client.footer,
                            iconURL: client.logo
                        })
                    ]})
                })
            })

        } else if (method === 'private_message') {

            await sql.query(`SELECT * FROM users WHERE folder="${client.interaction.user.id}"`, async (err, row) => {

                if (err) return client.interaction.reply({ embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('ERROR: Database Query Failed')
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription('Whoops, something went wrong with the Database Query')
                    .addFields({
                        name: 'Error',
                        value: `${err.message}`,
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ], ephemeral: true})

                if (!row[0]) return client.interaction.reply({ embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('ERROR: Query Not Found')
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription('Database query returned a 404 not found. Have you logged in/created an account?')
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ], ephemeral: true}) 

                return client.interaction.reply({ embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('Action: View Cookie')
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription('Here is your cordx upload server cookie.')
                    .addFields({
                        name: 'Cookie',
                        value: `${row[0].cookie}`,
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ], ephemeral: true})
            })
        }
    }
}