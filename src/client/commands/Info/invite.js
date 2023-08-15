module.exports = {
    name: 'invite',
    category: 'Info',
    description: 'Get my invite link',
    userPerms: [''],
    basePerms: [''],

    run: async (client) => {

        return client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('Invite Me')
            .setColor(client.colors.base)
            .setThumbnail(client.logo)
            .setDescription('Woah, you want me in your guild?')
            .addFields({
                name: 'Invite Link',
                value: `[Click Me](https://discord.com/api/oauth2/authorize?client_id=829634899748716546&permissions=49450776919873&scope=bot%20applications.commands)`,
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