module.exports = {
    name: 'channelUpdate',

    async execute(oldChannel, newChannel, client) {

        let guild = await client.guilds.cache.get('871204257649557604');
        let logs = await guild.channels.cache.get('871275187377688628');

        if (newChannel.guild.id !== '871204257649557604') return;

        if (newChannel.name !== oldChannel.name) return logs.send({
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('✏️ Channel name updated')
                .setColor(client.colors.base)
                .setThumbnail(client.logo)
                .setDescription('A channel\'s name has been updated')
                .addFields({
                    name: 'New Name',
                    value: `${newChannel.name}`,
                    inline: false
                },{
                    name: 'Old Name',
                    value: `${oldChannel.name}`,
                    inline: false
                },{
                    name: 'Channel ID',
                    value: `${newChannel.id}`,
                    inline: false
                })
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        else if (newChannel.nsfw !== oldChannel.nsfw) return logs.send({
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('✏️ Channel flag updated')
                .setColor(client.colors.base)
                .setThumbnail(client.logo)
                .setDescription('A channel\'s age restriction settings has been updated')
                .addFields({
                    name: 'Channel Name',
                    value: `${newChannel.name}`,
                    inline: false
                },{
                    name: 'Channel ID',
                    value: `${newChannel.id}`,
                    inline: false
                },{
                    name: 'New State',
                    value: `${newChannel.nsfw ? 'Channel is age restricted' : 'Channel is not age restricted'}`,
                    inline: false
                },{
                    name: 'Old State',
                    value: `${oldChannel.nsfw ? 'Channel is age restricted' : 'Channel is not age restricted'}`,
                    inline: false
                })
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        else if (newChannel.type !== oldChannel.type) return logs.send({
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('✏️ Channel type updated')
                .setColor(client.colors.base)
                .setThumbnail(client.logo)
                .setDescription('A channel\'s type has been updated')
                .addFields({
                    name: 'Channel Name',
                    value: `${newChannel.id}`,
                    inline: false
                },{
                    name: 'Channel ID',
                    value: `${newChannel.id}`,
                    inline: false
                },{
                    name: 'New Type',
                    value: `${newChannel.type}`,
                    inline: false
                },{
                    name: 'Old Type',
                    value: `${oldChannel.type}`,
                    inline: false
                })
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        else if (newChannel.position !== oldChannel.position) return logs.send({
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('✏️ Channel position updated')
                .setColor(client.colors.base)
                .setThumbnail(client.logo)
                .setDescription('A channel\'s position has been updated')
                .addFields({
                    name: 'Channel Name',
                    value: `${newChannel.name}`,
                    inline: false
                },{
                    name: 'Channel ID',
                    value: `${newChannel.id}`,
                    inline: false
                },{
                    name: 'New Position',
                    value: `${newChannel.position}`,
                    inline: false
                },{
                    name: 'Old Position',
                    value: `${oldChannel.position}`,
                    inline: false
                })
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });
    }
}