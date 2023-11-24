module.exports = {
  name: "versions",
  category: "Info",
  description: "View a list of all our system versions",
  userPerms: [""],
  basePerms: [""],

  run: async (client) => {

    try {

      const versions = await client.System.Versions();
      const current = await versions.current;
      const newest = await versions.newest;
      const stable = await versions.stable;

      const api = 'https://github.com/CordXApp/API';
      const bot = 'https://github.com/CordXApp/Client';
      const docs = 'https://github.com/CordXApp/Documentation'
      const web = 'https://beta.cordx.lol'

      return client.interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
          .setTitle('CordX Version Information')
          .setColor(client.colors.base)
          .setThumbnail(client.logo)
          .setDescription('Here is the current, newest and stable versions of our system(s)')
          .addFields({
            name: 'Current',
            value: `• [API](${api}): ${current.api}\n• [Client](${bot}): ${current.client}\n• [Website](${web}): ${current.website}\n• [Docs](${docs}): ${current.documentation}`,
            inline: true
          }, {
            name: 'Newest',
            value: `• [API](${api}): ${newest.api}\n• [Client](${bot}): ${newest.client}\n• [Website](${web}): ${newest.website}\n• [Docs](${docs}): ${newest.documentation}`,
            inline: true
          },{
            name: 'Stable',
            value: `• [API](${api}): ${stable.api}\n• [Client](${bot}): ${stable.client}\n• [Website](${web}): ${stable.website}\n• [Docs](${docs}): ${stable.documentation}`,
            inline: true
          })
        ]
      })

    } catch (e) {

      await console.log(e.stack);

      return client.interaction.reply({
        ephemeral: true,
        embeds: [
          new client.Gateway.EmbedBuilder()
          .setTitle('Internal Error')
          .setColor(client.colors.error)
          .setThumbnail(client.logo)
          .setDescription('Whoops, something went wrong here, this could be caused by either our client module or our api itself!')
          .addFields({
            name: 'Error',
            value: `${e.message}`,
            inline: true
          },{
            name: 'Status',
            value: '[beta.cordx.lol/status](https://beta.cordx.lol/status)',
            inline: true
          })

        ]
      })
    }
  },
};
