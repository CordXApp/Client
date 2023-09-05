const Axios = require("axios");
const bodyParser = require("body-parser");

module.exports = {
  name: "partners",
  category: "Partners",
  description: "List or manage our partners",
  userPerms: [""],
  basePerms: [""],
  options: [
    {
      name: "list",
      description: "Get a list of our partners",
      type: 1,
    },
    {
      name: "fetch",
      description: "Fetch a partner by name",
      options: [
        {
          name: "name",
          description: "Name of the partner (as seen on the site)",
          required: true,
          type: 3,
        },
      ],
      type: 1,
    },
    {
      name: "add",
      description: "Add a new partner (owner only)",
      options: [
        {
          name: "title",
          description: "Name of the new partner",
          required: true,
          type: 3,
        },
        {
          name: "banner",
          description: "Banner link for the partner.",
          required: true,
          type: 3,
        },
        {
          name: "bio",
          description: "Short description for the partner.",
          required: true,
          type: 3,
        },
        {
          name: "website",
          description: "Website link for the partner.",
          required: true,
          type: 3,
        },
        {
          name: "social",
          description: "Social media link for the partner",
          required: true,
          type: 3,
        },
      ],
      type: 1,
    },
    {
      name: "delete",
      description: "Delete a partner (owner only)",
      options: [
        {
          name: "title",
          description: "Name of the partner.",
          required: true,
          type: 3,
        },
      ],
      type: 1,
    },
  ],

  run: async (client) => {
    const urlencoded = new URLSearchParams();

    switch (client.interaction.options.getSubcommand()) {
      case "list":
        await fetch("https://api.cordx.lol/v3/partners/list")
          .then((res) => res.json())
          .then((data) => {
            let embed = new client.Gateway.EmbedBuilder()
              .setTitle("CordX Partners")
              .setColor(client.colors.base)
              .setThumbnail(client.logo)
              .setDescription("Here is a list of our current partners")
              .setTimestamp()
              .setFooter({
                text: client.footer,
                iconURL: client.logo,
              });

            data.map((p) => {
              embed.addFields({
                name: `${p.title}`,
                value: `${p.bio}`,
                inline: true,
              });
            });

            return client.interaction.reply({
              embeds: [embed],
            });
          });

        break;

      case "fetch":
        let partner = await client.interaction.options.getString("name");

        await fetch("https://api.cordx.lol/v3/partners/list")
          .then((res) => res.json())
          .then((data) => {
            let res = data.filter((p) => p.title == partner).map((p) => p);

            if (
              !res[0] ||
              res[0] == {} ||
              res[0] == undefined ||
              res[0].title == undefined
            )
              return client.interaction.reply({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("Error: not found")
                    .setColor(client.colors.error)
                    .setThumbnail(client.logo)
                    .setDescription("Unable to locate the provided partner")
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
                  .setTitle(res[0].title)
                  .setColor(client.colors.base)
                  .setThumbnail(client.logo)
                  .setImage(res[0].image)
                  .setDescription(res[0].bio)
                  .addFields({
                    name: "Links",
                    value: `[Website](${res[0].url}) | [Social Media](${res[0].social})`,
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

        break;

      case "add":
        let title = client.interaction.options.getString("title");
        let banner = client.interaction.options.getString("banner");
        let bio = client.interaction.options.getString("bio");
        let website = client.interaction.options.getString("website");
        let social = client.interaction.options.getString("social");

        if (!client.perms.Admins.includes(client.interaction.member.id))
          return client.interaction.reply({
            embeds: [
              new client.Gateway.EmbedBuilder()
                .setTitle("Error: unauthorized")
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription(
                  "You are not authorized to execute this command"
                )
                .setTimestamp()
                .setFooter({
                  text: client.footer,
                  iconURL: client.logo,
                }),
            ],
          });

        urlencoded.append("Authorization", client.config.API.secret);
        urlencoded.append("title", title);
        urlencoded.append("image", banner);
        urlencoded.append("bio", bio);
        urlencoded.append("url", website);
        urlencoded.append("social", social);
        urlencoded.append("Method", "add");

        await Axios.post(
          `https://api.cordx.lol/v3/partners/manage`,
          urlencoded,
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              "cache-control": "no-cache",
            },
          }
        )
          .then((res) => {
            if (res.status === 200)
              return client.interaction.reply({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("Success: partner added")
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription(`${title} has been added to our partners`)
                    .addFields(
                      {
                        name: "Banner",
                        value: `${banner}`,
                        inline: true,
                      },
                      {
                        name: "Description",
                        value: `${bio}`,
                        inline: true,
                      },
                      {
                        name: "Website",
                        value: `${website}`,
                        inline: true,
                      },
                      {
                        name: "Social",
                        value: `${social}`,
                        inline: true,
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
          .catch((e) => {
            if (e.status !== 200) {
              return client.interaction.reply({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("Error: failed to add partner")
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription(`See below for details!`)
                    .addFields(
                      {
                        name: "Code",
                        value: `${e.response.data.code}`,
                        inline: false,
                      },
                      {
                        name: "Message",
                        value: `${e.response.data.message}`,
                        inline: false,
                      },
                      {
                        name: "Solutions",
                        value: `${e.response.data.errormsg}`,
                        inline: false,
                      },
                      {
                        name: "Status Code",
                        value: `${e.response.data.status}`,
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
            }
          });

        break;

      case "delete":
        let name = client.interaction.options.getString("title");

        if (!client.perms.Admins.includes(client.interaction.member.id))
          return client.interaction.reply({
            embeds: [
              new client.Gateway.EmbedBuilder()
                .setTitle("Error: unauthorized")
                .setColor(client.colors.error)
                .setThumbnail(client.logo)
                .setDescription(
                  "You are not authorized to execute this command"
                )
                .setTimestamp()
                .setFooter({
                  text: client.footer,
                  iconURL: client.logo,
                }),
            ],
          });

        urlencoded.append("Authorization", client.config.API.secret);
        urlencoded.append("title", name);
        urlencoded.append("Method", "delete");

        await Axios.post(
          `https://api.cordx.lol/v3/partners/manage`,
          urlencoded,
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              "cache-control": "no-cache",
            },
          }
        )
          .then((res) => {
            if (res.status === 200)
              return client.interaction.reply({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("Success: partner deleted")
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription(
                      `${name} has been removed from our partners`
                    )
                    .setTimestamp()
                    .setFooter({
                      text: client.footer,
                      iconURL: client.logo,
                    }),
                ],
              });
          })
          .catch((e) => {
            if (e.status !== 200) {
              return client.interaction.reply({
                embeds: [
                  new client.Gateway.EmbedBuilder()
                    .setTitle("Error: failed to add partner")
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription(`See below for details!`)
                    .addFields(
                      {
                        name: "Code",
                        value: `${e.response.data.code}`,
                        inline: false,
                      },
                      {
                        name: "Message",
                        value: `${e.response.data.message}`,
                        inline: false,
                      },
                      {
                        name: "Solutions",
                        value: `${e.response.data.errormsg}`,
                        inline: false,
                      },
                      {
                        name: "Status Code",
                        value: `${e.response.data.status}`,
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
            }
          });
    }
  },
};
