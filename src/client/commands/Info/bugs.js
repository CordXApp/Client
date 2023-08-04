module.exports = {
    name: 'bugs',
    category: 'Info',
    description: 'Where to submit a bug report',
    userPerms: [''],
    basePerms: [''],

    run: async (client) => {

        return client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('Bug Reports')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription('You can submit a bug report below')
            .addFields({
                name: 'Issue Tracker',
                value: `[github.com/CordXApp/Client/issues](https://github.com/CordXApp/Client/issues)`,
                inline: false
            })
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ]})
    }
}