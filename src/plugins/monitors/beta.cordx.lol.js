const { UptimeClient } = require("@infinitylist/uptime");
const moment = require("moment");

module.exports.startProdSiteMonitor = async ({ client }) => {
  const guild = await client.guilds.cache.get("871204257649557604");
  const chan = await guild.channels.cache.find(
    (c) => c.id == "1148439450569953280",
  );

  const uptime = new UptimeClient("https://beta.cordx.lol", {
    interval: 900000,
    retries: 3,
  });

  uptime._start();

  uptime.on("up", async (up) => {
    console.log(up);

    function dhms(t) {
      (d = Math.floor(t / (1000 * 60 * 60 * 24))),
        (h = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        (m = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))),
        (s = Math.floor((t % (1000 * 60)) / 1000));
      return (
        d + " Day(s) " + h + " Hour(s) " + m + " Minute(s) " + s + " Second(s)"
      );
    }

    await chan.send({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle(`Status of: ${uptime.infos.url}`)
          .setColor(client.colors.base)
          .setThumbnail(client.logo)
          .setDescription(`**UP for:** ${dhms(up.uptime)}`)
          .addFields(
            {
              name: "Status",
              value: "🟢 ONLINE",
              inline: false,
            },
            {
              name: "Failures",
              value: `${up.failures ? up.failures : 0}`,
              inline: false,
            },
            {
              name: "Ping",
              value: `${up.ping + "ms"}`,
            },
          )
          .setTimestamp()
          .setFooter({
            text: client.footer,
            iconURL: client.logo,
          }),
      ],
    });
  });

  uptime.on("outage", async (outage) => {
    if (outage.statusCode || !outage.includes("monitor failure"))
      await chan.send({
        embeds: [
          new client.Gateway.EmbedBuilder()
            .setTitle(`Status of: ${uptime.infos.url}`)
            .setColor(client.colors.base)
            .setThumbnail(client.logo)
            .setDescription("Whoops, the website sent a bad response")
            .addFields(
              {
                name: "Status",
                value: "🔴 OFFLINE",
                inline: false,
              },
              {
                name: "Code",
                value: outage.statusCode,
                inline: false,
              },
              {
                name: "Message",
                value: outage.statusText,
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
  });

  uptime.on("error", async (error) => {
    await console.error(error);

    await chan.send({
      embeds: [
        new client.Gateway.EmbedBuilder()
          .setTitle(`Status of: ${uptime.infos.url}`)
          .setColor(client.colors.base)
          .setThumbnail(client.logo)
          .setDescription(
            "Something went wrong here, check the console for details. Monitor will be stopped now!",
          )
          .setTimestamp()
          .setFooter({
            text: client.footer,
            iconURL: client.logo,
          }),
      ],
    });

    await uptime._setInterval(0);

    return uptime._stop();
  });
};
