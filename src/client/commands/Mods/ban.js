module.exports = {
  name: "ban",
  category: "Mods",
  description: "Ban a member of the server",
  userPerms: [""],
  basePerms: ["BAN_MEMBERS", "MODERATE_MEMBERS"],
  options: [
    {
      name: "user",
      description: "The user you want to ban",
      required: true,
      type: 6,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      required: true,
      type: 3,
    },
  ],

  run: async (client) => {
    let member = await client.interaction.options.getMember("user");
    let reason = await client.interaction.options.getString("reason");
    let mod_log = await client.interaction.guild.channels.cache.find(
      (c) => c.id === "871275213013262397",
    );
    let modname = client.interaction.user.globalName
      ? client.interaction.user.globalName
      : client.interaction.user.username;

    if (!client.interaction.guild.id === "871204257649557604") return;

    if (!member.manageable)
      return client.interaction.reply({
        ephemeral: true,
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("Error: invalid hierarchy")
            .setColor(client.colors.error)
            .setThumbnail(client.logo)
            .setDescription(
              "Hold up chief, this user is higher in the role hierarchy then i am or they are the guild owner.",
            )
            .setTimestamp()
            .setFooter({
              text: client.footer,
              iconURL: client.logo,
            }),
        ],
      });

    if (!member.moderatable)
      return client.interaction.reply({
        ephemeral: true,
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("Error: invalid permissions")
            .setColor(client.colors.error)
            .setThumbnail(client.logo)
            .setDescription(
              "User is unable to be banned as i am unable to moderate them!",
            )
            .setTimestamp()
            .setFooter({
              text: client.footer,
              iconURL: client.logo,
            }),
        ],
      });

    if (member == client.interaction.member) return;

    await client.interaction.guild.bans
      .create(member.user.id, { reason: reason })
      .then(async (banned) => {
        await mod_log.send({
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("🔨 User banned!")
              .setColor(client.colors.error)
              .setThumbnail(banned.displayAvatarURL({ dynamic: true }))
              .setDescription(
                "Whoops, someone messed up and got the ban hammer!",
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
                },
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
              .setTitle("🔨 User banned successfully")
              .setColor(client.colors.success)
              .setThumbnail(banned.displayAvatarURL({ dynamic: true }))
              .setDescription(
                "Whoops, someone messed up and got the ban hammer!",
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
                },
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
          header: "GUILD_BAN_CREATE",
          type: "error",
        });

        return client.interaction.reply({
          ephemeral: true,
          embeds: [
            new client.Gateway.EmbedBuilder()
              .setTitle("Error: ban failed")
              .setColor(client.colors.error)
              .setThumbnail(client.logo)
              .setDescription("Whoops, something went wrong")
              .addFields({
                name: "Error",
                value: `${e.message}`,
                inline: false,
              })
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
