const ms = require('ms');

module.exports = {
    name: 'timeout',
    category: 'Mods',
    description: 'Timeout a member of the server.',
    userPerms: [''],
    basePerms: ['MUTE_MEMBERS'],
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
        },
        {
            name: 'duration',
            description: 'Timeout duration  (30m, 1h, 1d etc)',
            required: true,
            type: 3
        },
        {
            name: 'update',
            description: 'Are you updating a active time out?',
            required: true,
            type: 5  
        }
    ],

    run: async (client) => {
        let member = await client.interaction.options.getMember('user');
        let reason = await client.interaction.options.getString('reason');
        let duration = await client.interaction.options.get('duration')?.value;
        let update = await client.interaction.options.get('update')?.value;
        let mod_log = await client.interaction.guild.channels.cache.find((c) => c.id === '871275213013262397');
        let username = member?.user?.globalName ? member?.user?.globalName : member.user.username;
        let modname = client.interaction.user.globalName ? client.interaction.user.globalName : client.interaction.user.username;

        if (!client.interaction.guild.id === '871204257649557604') return;
        if (member == client.interaction.member) return;

        let userRolePos = member.roles.highest.position;
        let modsRolePos = client.interaction.member.roles.highest.position;
        let botRolePos = client.interaction.guild.members.me.roles.highest.position;

        const ms_duration = ms(duration)

        /**if (member.user.bot) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: invalid user')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('Whoops, i am unable to timeout another bot. If a bot is causing issues please just ban/kick it')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });*/

        if (userRolePos >= modsRolePos) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: mismatched permission hierarchy')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('Whoops, looks like the user you are trying to timeout has a role that is equal to or higher then your\'s.')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        await client.interaction.options.get('method')?.value;

        if (userRolePos >= botRolePos) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: mismatched permission hierarchy')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('Whoops, looks like the user you are trying to timeout has a role that is equal to or higher then mine')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        if (isNaN(ms_duration)) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: invalid duration')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('Please provide a valid duration in ms')
                .addFields({
                    name: 'Example',
                    value: '30m = 30 Minutes, 1d = 1 Day etc etc',
                    inline: false
                })
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        if (ms_duration < 5000 || ms_duration > 2.419e9) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: invalid duration')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('Whoops, the duration for a timeout can not be less then 5 seconds or more then 28 days')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        if (member.isCommunicationDisabled() && !update) return client.interaction.reply({
            ephemeral: true,
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Error: user timed out')
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription('The user you provided is already timed out if you want to update their timeout duration please re-run this command and set the "update" params to true')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        })

        await member.timeout(ms_duration, reason)
        .then(async() => {

            const { default: prettyMs } = await import ('pretty-ms');

            if (member.isCommunicationDisabled() && update) {

                await mod_log.send({ 
                    embeds: [
                        new client.Gateway.EmbedBuilder()
                        .setTitle('🕒 Timeout updated')
                        .setColor(client.colors.success)
                        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                        .setDescription('Someone\'s timeout duration has been updated')
                        .addFields({
                            name: 'User',
                            value: `${username}`,
                            inline: false
                        },{
                            name: 'User ID',
                            value: `${member.id}`,
                            inline: false
                        },{
                            name: 'Moderator',
                            value: `${modname}`,
                            inline: false
                        },{
                            name: 'Reason',
                            value: `${reason}`,
                            inline: false
                        },{
                            name: 'Duration',
                            value: `${prettyMs(ms_duration, { verbose: true})}`,
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
                        .setTitle('Success: timeout updated')
                        .setColor(client.colors.success)
                        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                        .setDescription(`${username}\'s timeout duration has been updated by: ${prettyMs(ms_duration, { verbose: true })}`)
                        .setTimestamp()
                        .setFooter({
                            text: client.footer,
                            iconURL: client.logo
                        })
                    ]
                })
            }
             else {

                await mod_log.send({ 
                    embeds: [
                        new client.Gateway.EmbedBuilder()
                        .setTitle('🕒 User timed out')
                        .setColor(client.colors.success)
                        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                        .setDescription('Someone has been timed out!')
                        .addFields({
                            name: 'User',
                            value: `${username}`,
                            inline: false
                        },{
                            name: 'User ID',
                            value: `${member.id}`,
                            inline: false
                        },{
                            name: 'Moderator',
                            value: `${modname}`,
                            inline: false
                        },{
                            name: 'Reason',
                            value: `${reason}`,
                            inline: false
                        },{
                            name: 'Duration',
                            value: `${prettyMs(ms_duration, { verbose: true})}`,
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
                        .setTitle('Success: user timed out')
                        .setColor(client.colors.success)
                        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                        .setDescription(`${username} has been timed out for: ${prettyMs(ms_duration, { verbose: true })}`)
                        .setTimestamp()
                        .setFooter({
                            text: client.footer,
                            iconURL: client.logo
                        })
                    ]
                })
            }

        })        
    }
}