module.exports = {
    name: "guildMemberAdd",

    async execute(member, client) {
        if (member.guild.id !== "871204257649557604") return; // Only process events in the specific guild

        try {
            const mRoleId = "871275762601299988";
            const bRoleId = "871278093199884288";
            const lChannelId = "871275187377688628";

            const mRole = member.guild.roles.cache.get(mRoleId);
            const bRole = member.guild.roles.cache.get(bRoleId);
            const lChannel = member.guild.channels.cache.get(lChannelId);

            const username = member.user.globalName || member.user.username;

            if (!member.user.bot) {
                await member.roles.add(mRole);

                await client.logger(`Role added to: ${member.user.id}`);

                const userEmbed = new client.Gateway.EmbedBuilder()
                    .setTitle("A new user has joined")
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription(`${username} has joined the server`)
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo,
                    });

                return lChannel.send({ embeds: [userEmbed] });
            } else {
                await member.roles.add(bRole);

                const botEmbed = new client.Gateway.EmbedBuilder()
                    .setTitle("A new bot has joined")
                    .setColor(client.color)
                    .setThumbnail(client.logo)
                    .setDescription(`${username} has joined the server`)
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo,
                    });

                return lChannel.send({ embeds: [botEmbed] });
            }
        } catch (error) {
            await client.logger(`${error.stack}`, {
                header: "GUILD_MEMBER_ADD",
                type: "error",
            });
        }
    },
};