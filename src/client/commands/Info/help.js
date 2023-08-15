const { filterSlash } = require("@plugins/filters/commands");

module.exports = {
  name: "help",
  category: "Info",
  description: "View my help message or get command info",
  userPerms: [""],
  basePerms: [""],
  options: [
    {
      name: "command",
      description: "Command name to get info for",
      type: 3,
      required: false,
    },
  ],

  run: async (client) => {
    let cmd = await client.interaction.options.getString("command");

    if (cmd && !client.slash.get(cmd))
      return client.interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("ERROR: Invalid Command")
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription(
              "Hold up chief, the command you are looking for does not exist",
            )
            .setTimestamp()
            .setFooter({
              text: client.footer,
              iconURL: client.logo,
            }),
        ],
      });
    else if (cmd && client.slash.get(cmd)) {
      const cmdFetch = await client.slash.get(cmd);
      const cmdName =
        cmdFetch.name.charAt(0).toUpperCase() + cmdFetch.name.slice(1);

      return client.interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("Command Information")
            .setColor(client.color)
            .setThumbnail(client.logo)
            .setDescription(`Information for the ${cmdName} command`)
            .addFields(
              {
                name: "Description",
                value: `${cmdFetch.description}`,
                inline: false,
              },
              {
                name: "Category",
                value: `${cmdFetch.category}`,
                inline: false,
              },
              {
                name: "Special Permissions",
                value: `${
                  !cmdFetch.userPerms.includes("")
                    ? cmdFetch.userPerms
                    : "No special permissions required"
                }`,
                inline: false,
              },
              {
                name: "User Permissions",
                value: `${
                  !cmdFetch.basePerms.includes("")
                    ? cmdFetch.basePerms
                    : "No user permissions required"
                }`,
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
    }

    let infoCommands;

    return client.interaction.reply({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle("Commands List")
          .setColor(client.colors.base)
          .setThumbnail(client.logo)
          .setDescription("Here is a list of my commands")
          .addFields(
            {
              name: "Info Commands",
              value: await filterSlash({ client: client, category: "Info" }),
            },
            {
              name: "Fun Commands",
              value: await filterSlash({ client: client, category: "Fun" }),
            },
            {
              name: "Mod Commands",
              value: await filterSlash({ client: client, category: "Mods" }),
            },
            {
              name: "ShareX Commands",
              value: await filterSlash({ client: client, category: "Sharex" }),
            },
          )
          .setTimestamp()
          .setFooter({
            text: client.footer,
            iconURL: client.logo,
          }),
      ],
    });
  },
};
