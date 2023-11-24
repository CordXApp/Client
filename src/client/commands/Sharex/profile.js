module.exports = {
  name: "profile",
  category: "Sharex",
  description: "View your cordx profile/information",
  userPerms: [""],
  basePerms: [""],
  options: [
    {
      name: "user",
      description: "Leave empty to fetch your own profile.",
      required: false,
      type: 6,
    },
  ],

  run: async (client) => {

    let member = (await client.interaction.options.getMember("user")) || client.interaction.user;

    await fetch(`${client.config.API.domain}users/${member.id}/stats`)
    .then((res) => res.json())
    .then((data) => {
    
      let images = data.files.images;
      let downloads = data.files.downloads;
      let videos = data.files.mp4;
      let storeRemaining = data.storage.remains;
      let storeUsed = data.storage.used;

      let png = data.files.png;
      let gif = data.files.gif;
      let other = data.files.other;

      return client.interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
          .setTitle(`Profile for: ${member.globalName ? member.globalName : member.user.globalName}`)
          .setColor(client.colors.base)
          .setThumbnail(member.displayAvatarURL({ dynamic: true }))
          .addFields({
            name: 'Stored Images',
            value: `${images ? images : 0} total`,
            inline: false
          },{
            name: 'Stored Downloads',
            value: `${downloads ? downloads : 0} total`,
            inline: false
          },{
            name: 'Stored Videos',
            value: `${videos ? videos : 0} total`,
            inline: false
          },{
            name: 'Storage Info',
            value: `Using: ${storeUsed}/${storeRemaining}`,
            inline: false
          },{
            name: 'File Stats',
            value: `• 🖼️ PNG\'s: ${png}\n• 🎞️ GIF\'s: ${gif}\n• ❔ Other: ${other}`,
            inline: false
          })
          .setTimestamp()
          .setFooter({
            text: client.footer,
            iconURL: client.logo
          })
        ]
      })
    })
    .catch((e) => {
      return client.interaction.reply({
        embeds: [
          new client.Gateway.EmbedBuilder()
          .setTitle('Error: api unavailable')
          .setColor(client.colors.error)
          .setThumbnail(client.logo)
          .setDescription('Hold up chief, we either don\'t have any data on you or something is wrong with our API. Have you logged into/created an account on our [beta site](https://beta.cordx.lol)?')
          .addFields({
            name: 'Error',
            value: `${e.message}`,
            inline: true
          },{
            name: 'Status',
            value: '[beta.cordx.lol/status](https://beta.cordx.lol/status)',
            inline: true
          })
          .setTimestamp()
          .setFooter({
            text: client.footer,
            iconURL: client.logo
          })
        ]
      })
    })
  },
};
