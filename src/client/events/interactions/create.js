const {
  customCommandPermCheck,
  baseCommandPermCheck,
} = require("@functions/permCheck");
const { PasteClient } = require("@cordxapp/pastes");
const wait = require('node:timers/promises').setTimeout;
const paste = new PasteClient();

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (!interaction.isCommand()) return;
    if (!interaction.isChatInputCommand()) return;

    client.interaction = interaction;

    const command = client.slash.get(interaction.commandName);

    if (!command) return;

    let customCmdPermCheck = await customCommandPermCheck({
      perms: command.userPerms,
      user: interaction.user,
      conf: client.perms.Admins,
    });

    let baseCmdPermCheck = await baseCommandPermCheck({
      perms: command.basePerms,
      user: interaction.member.permissions,
    });

    if (!customCmdPermCheck && !command.userPerms.includes(""))
      return interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("ERROR: Invalid permissions")
            .setColor(client.colors.error)
            .setThumbnail(client.logo)
            .setDescription(
              "Hold up chief, you do not have the necessary permissions for this command",
            )
            .addFields({
              name: "Required Permissions",
              value: `${!command.userPerms ? "undefined" : command.userPerms}`,
              inline: false,
            })
            .setTimestamp()
            .setFooter({
              text: client.footer,
              iconURL: client.logo,
            }),
        ],
        ephemeral: true,
      });

    if (!baseCmdPermCheck && !command.basePerms.includes(""))
      return interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("ERROR: Invalid permissions")
            .setColor(client.colors.error)
            .setThumbnail(client.logo)
            .setDescription(
              "Hold up chief, you do not have the necessary permissions for this command",
            )
            .addFields({
              name: "Required Permissions",
              value: `${!command.basePerms ? "undefined" : command.basePerms}`,
              inline: false,
            })
            .setTimestamp()
            .setFooter({
              text: client.footer,
              iconURL: client.logo,
            }),
        ],
        ephemeral: true,
      });

    /**
     * EXECUTE THE INTERACTION HERE AFTER PERM CHECKS
     */
    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);

        option?.options?.forEach((x) => {
          if (x.value) args.push(option.value);
        });
      } else if (option.value) args.push(option.value);
    }

    try {
      command.run(client, interaction, args);
    } catch (e) {
      await client.logger(e.stack, { header: "COMMAND_ERROR", type: "error" });

      return interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle("FATAL: Internal Error")
            .setColor(client.colors.error)
            .setThumbnail(client.logo)
            .setDescription(`Hold up, something just ain't right here!`)
            .addFields(
              {
                name: "Error Message",
                value: `${e.message}`,
                inline: false,
              },
              {
                name: "Report Issues",
                value: `[https://github.com/CordXApp/Client/issues](https://github.com/CordXApp/Client/issues)`,
                inline: false,
              },
            )
            .setFooter({
              text: client.footer,
              iconURL: client.logo,
            }),
        ],
      });
    }
  },
};
