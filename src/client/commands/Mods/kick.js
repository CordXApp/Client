module.exports = {
    name: 'kick',
    category: 'Mods',
    description: 'Kick a member of the server',
    userPerms: [''],
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

        if (!client.interaction.guild.id === '871204257649557604') return;

        let username = member?.user?.globalName ? member?.user?.globalName : member.user.username;
        let modname = client.interaction.user.globalName ? client.interaction.user.globalName : client.interaction.user.username

        let userRolePos = member.roles.highest.position;
        let modsRolePos = client.interaction.member.roles.highest.position;
        let botRolePos = client.interaction.guild.members.me.roles.highest.position;

        if (member == client.interaction.member) return;

        if (userRolePos >= modsRolePos) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: mismatched permission hierarchy')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('Whoops, looks like the user you are trying to kick has a role that is equal to or higher then your\'s.')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        })

        if (userRolePos >= botRolePos) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: mismatched permission hierarchy')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('Whoops, looks like the user you are trying to kick has a role that is equal to or higher then mine')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        })

        await member.kick(`${reason}`)
        .then(async () => {

            await mod_log.send({
                embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('👢 user kicked')
                    .setColor(client.colors.error)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setDescription('Uh-Oh, someone got the boot!')
                    .addFields({
                        name: 'User',
                        value: `${username}`,
                        inline: true
                    },{
                        name: 'User ID',
                        value: `${member.user.id}`,
                        inline: true
                    },{
                        name: 'Moderator',
                        value: `${modname}`,
                        inline: true
                    },{
                        name: 'Reason',
                        value: `${reason}`,
                        inline: true
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
                    .setTitle('Success: user kicked')
                    .setColor(client.colors.success)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${username} has been kicked!`)
                    .addFields({
                        name: 'Moderator',
                        value: `${modname}`,
                        inline: false
                    },{
                        name: 'Reason',
                        value: `${reason}`,
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
        .catch((e) => {

            return client.interaction.reply({
                embeds: [
                    new client. Gateway.EmbedBuilder()
                    .setTitle('Error: kick failed')
                    .setColor(client.colors.error)
                    .setThumbnail(client.logo)
                    .setDescription('Whoops, something went wrong here!')
                    .addFields({
                        name: 'Error',
                        value: `${e.message}`,
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
    }
}