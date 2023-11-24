const { UptimeClient } = require("@infinitylist/uptime");
const moment = require("moment");

module.exports.websiteMonitor = async ({
  client,
  domain,
  interval,
  retries,
  logChannelId,
}) => {
  if (!client)
    return console.log(
      "[ERROR - client]: please provide a valid monitor client",
    );
  if (!domain)
    return console.log(
      "[ERROR - domain]: please provide a valid monitor domain",
    );
  if (!interval)
    return console.log(
      "[ERROR - interval]: please provide a valid monitor interval",
    );
  if (!retries)
    return console.log(
      "[ERROR - retries]: please provide a valid number of monitor retries",
    );
  if (!logChannelId)
    return console.log(
      "[ERROR - logChannelId]: please provide a discord channel id",
    );

  if (interval < 900000)
    return console.log(
      "[ERROR]: monitor interval should be greater then 900000",
    );
  if (retries > 3)
    return console.log(
      "[ERROR]: maximum amount of retries should be 3 or less",
    );

  const guild = await client.guilds.cache.get("871204257649557604");
  const chan = await guild.channels.cache.find((c) => c.id === logChannelId);

  if (!chan)
    return console.log(
      "[ERROR - logChannelId]: please provide a valid discord channel id",
    );

  const uptime = new UptimeClient(domain, {
    interval: interval,
    retries: retries,
  });

  await uptime._start();

  /**
   * ONLINE RESPONSE
   */
  uptime.on("up", async (up) => {
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

  /**
   * OFFLINE RESPONSE
   */
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

  /**
   * ERROR RESPONSE
   */
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
