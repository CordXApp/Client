module.exports = {
    name: 'ban',
    category: 'Mods',
    description: 'Ban a member of the server',
    userPerms: ['BAN_MEMBERS'],
    basePerms: ['BAN_MEMBERS'],
    options: [
        {
            name: 'user',
            description: 'The user you want to ban',
            required: true,
            type: 6
        },
        {
            name: 'reason',
            description: 'The reason for the ban',
            required: true,
            type: 3
        }
    ],

    run: async (client) => {
        let member = await client.interaction.options.getMember('user');
        let reason = await client.interaction.options.getString('reason');
        let mod_log = await client.interaction.guild.channels.cache.find((c) => c.id === '871275213013262397');

        if (!member.bannable) return client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('ERROR: Invalid Permissions')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription('User is unable to be banned due to permissions or hierarchy!')
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ], ephemeral: true});

        if (member == client.interaction.member) return client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('ERROR: Invalid User')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription('Hold up, you can not ban yourself! noob.')
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ]}) 

        let username = member.user.globalName ? member.user.globalName : member.user.username
        let modname = client.interaction.user.globalName ? client.interaction.user.globalName : client.interaction.user.username


        await client.interaction.reply({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('SUCCESS: User Banned!')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription(`${username} was a victim of the ban hammer`)
            .setTimestamp()
            .setFooter({
                text: client.footer,
                iconURL: client.logo
            })
        ]})

        await mod_log.send({ embeds: [
            new client.Gateway.EmbedBuilder()
            .setTitle('Action: Guild Member Ban')
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription(`${username} was banned`)
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

        return client.interaction.guild.members.ban(member, { reason });
    }
}