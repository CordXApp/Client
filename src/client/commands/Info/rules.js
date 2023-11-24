const package = require("../../../../package.json");

module.exports = {
  name: "rules",
  category: "Info",
  description: "Server Rules",
  userPerms: [""],
  basePerms: ["ManageGuild"],

  run: async (client) => {
    return client.interaction.channel.send({
        embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle("Server Rules")
          .setColor(client.colors.base)
          .setDescription("**Support**\nPlease do not mention/dm members/staff/roles for support anywhere unless they have stated otherwise, you may mention the <@&1138246343412953218> role after you have waited for at least 15 minutes without receiving support in the ⁠<#1134399965150597240>. Violation of this rule will result in a 15 minutes mute.\n\n**Illegal Content & Discord ToS**\nPlease refrain from mentioning or sending anything that is deemed illegal by the law (world wide/European/American laws), also please refrain from mentioning or sending anything that is deemed disallowed by the Discord Terms of Services. Violation of this rule will result in a permanent ban from the server and as addition to that you will be reported to the Discord support team.\n\n**Respect**\nTreat others in this server with respect, everyone here is equal and no one is worth less than another. If you got a problem with someone, either report them to our moderation team or take it to dm's. Violation of this rule will result in a 24 hour ban from the server, violating the rule again afterwards will result in a permanent ban from the server.\n\n**Alt Accounts**\nWe do not allow alt accounts in our server as a way to evade bans or mutes. If they’re being used in a respectful manor to communicate in our server however is totally fine\n\n**Rule Loopholes**\nWe do not appreciate you trying to find ways to work around rules, loopholes will be dealt with heavier than they would have been without the loophole. The moderation team decides what these actions will be.\n\n__We may add new rules, remove existing ones or change existing ones at any given time when we feel necessary. Please check back here regularly to stay up-to-date to the rules.__\n\n• last updated: August 8, 2023")
          .setFooter({
            text: client.footer,
            iconURL: client.logo,
          }),
        ],
    });
  },
};