module.exports = {
  name: "unban",
  category: "Mods",
  description: "Remove someone from the servers ban list",
  userPerms: [""],
  basePerms: ["BAN_MEMBERS", "MODERATE_MEMBERS"],
  options: [
    {
      name: "userid",
      description: "The id of the user you want to unban",
      required: true,
      type: 3,
    },
    {
      name: "reason",
      description: "The reason for the unban",
      required: true,
      type: 3,
    },
  ],

  run: async (client) => {
    let member = await client.interaction.options.getString("userid");
    let reason = await client.interaction.options.getString("reason");
    let mod_log = await client.interaction.guild.channels.cache.find(
      (c) => c.id === "871275213013262397"
    );
    let modname = client.interaction.user.globalName
      ? client.interaction.user.globalName
      : client.interaction.user.username;

    if (!client.interaction.guild.id === "871204257649557604") return;

    if (member == client.interaction.member) return;

    await client.interaction.guild.bans
      .remove(member, reason)
      .then(async (banned) => {
        await mod_log.send({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("🔨 User unbanned!")
              .setColor(client.colors.success)
              .setThumbnail(banned.displayAvatarURL({ dynamic: true }))
              .setDescription(
                "Wow, someone has got another chance, hopefully they don't mess it up!"
              )
              .addFields(
                {
                  name: "User",
                  value: `${
                    banned.globalName ? banned.globalName : banned.username
                  }`,
                  inline: true,
                },
                {
                  name: "User ID",
                  value: `${banned.id}`,
                  inline: true,
                },
                {
                  name: "Moderator",
                  value: `${modname}`,
                  inline: true,
                },
                {
                  name: "Reason",
                  value: `${reason}`,
                  inline: false,
                }
              )
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });

        return client.interaction.reply({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("🔨 User unbanned successfully!")
              .setColor(client.colors.success)
              .setThumbnail(banned.displayAvatarURL({ dynamic: true }))
              .setDescription(
                "Wow, someone has got another chance, hopefully they don't mess it up!"
              )
              .addFields(
                {
                  name: "User",
                  value: `${
                    banned.globalName ? banned.globalName : banned.username
                  }`,
                  inline: true,
                },
                {
                  name: "User ID",
                  value: `${banned.id}`,
                  inline: true,
                },
                {
                  name: "Moderator",
                  value: `${modname}`,
                  inline: true,
                },
                {
                  name: "Reason",
                  value: `${reason}`,
                  inline: false,
                }
              )
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });
      })
      .catch(async (e) => {
        await client.logger(`${e.stack}`, {
          header: "GUILD_BAN_REMOVE",
          type: "error",
        });

        return client.interaction.reply({
          ephemeral: true,
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Error: unban failed")
              .setColor(client.colors.error)
              .setThumbnail(client.logo)
              .setDescription(
                "Unable to unban the provided user, are you sure they are banned?"
              )
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              }),
          ],
        });
      });
  },
};
