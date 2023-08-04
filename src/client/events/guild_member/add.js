module.exports = {
  name: "guildMemberAdd",

  async execute(member, client) {
    if (!member.guild.id === "871204257649557604") return; // Ignore the event if triggering guild is not the support guild

    try {
      /**
       * @default m_role Define the role to add to new users
       * @default b_role Define the role to add to new bots
       * @default l_chan Define the channel to send logs to
       */
      let m_role = await member.guild.roles.cache.get("871275762601299988");
      let b_role = await member.guild.roles.cache.get("871278093199884288");
      let l_chan = await member.guild.channels.cache.find(
        (c) => c.id === "871275187377688628",
      );

      /**
       * @default username Check if the user is using discord's new or old username's
       */
      let username = member.user.globalName
        ? member.user.globalName
        : member.user.username;

      if (!member.user.bot) {
        await member.roles.add(m_role);

        await client.logger(`Role added to: ${member.user.id}`);

        return l_chan.send({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("A new user has spawned")
              .setColor(client.color)
              .setThumbnail(client.logo)
              .setDescription(`${username} has slid into the server`)
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });
      } else {
        await member.roles.add(b_role);

        return l_chan.send({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("A new bot has spawned")
              .setColor(client.color)
              .setThumbnail(client.logo)
              .setDescription(`${username} has slid into the server!`)
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });
      }
    } catch (e) {
      return client.logger(`${err.stack}`, {
        header: "GUILD_MEMBER_ADD",
        type: "error",
      });
    }
  },
};
