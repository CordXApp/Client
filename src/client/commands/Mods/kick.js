module.exports = {
    name: 'kick',
    category: 'Mods',
    description: 'Kick a member of the server',
    userPerms: ['KICK_MEMBERS'],
    basePerms: ['KICK_MEMBERS'],
    options: [
        {
            name: 'user',
            description: 'The user you want to kick',
            required: true,
            type: 6
        },
        {
            name: 'reason',
            description: 'The reason for kicking the user',
            required: true,
            type: 3
        }
    ],

    run: async (client) => {
        let member = await client.interaction.options.getMember('user');
        let reason = await client.interaction.options.getString('reason');
        let mod_log = await client.interaction.guild.channels.cache.find((c) => c.id === '871275213013262397');

        if (member == client.interaction.member) return client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('ERROR: Invalid User')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription('Hold up, you can not kick yourself! noob.')
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ]})
        
        if (!member.kickable) return client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('ERROR: Unable to Kick')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription('Unable to kick this user due to permissions or hierarchy')
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ]})

        let username = member?.user?.globalName ? member?.user?.globalName : member.user.username;
        let modname = client.interaction.user.globalName ? client.interaction.user.globalName : client.interaction.user.username

        await client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('SUCCESS: User Kicked')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription(`${username} has received the boot`)
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ]})

        await mod_log.send({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('SUCCESS: User Kicked')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription(`${username} has received the boot`)
            .addFields({
                name: 'Moderator',
                value: `${modname}`,
                inline: false
            }, {
                name: 'Reason',
                value: `${reason}`,
                inline: false
            })
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ]})

        return member.kick(`${reason}`);
    }
}