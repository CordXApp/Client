const { UptimeClient } = require('@infinitylist/uptime');
const moment = require('moment');

module.exports = {
    name: "status",
    category: "Status",
    description: "Check the status of one of our systems",
    userPerms: [""],
    basePerms: [""],
    options: [
      {
        name: "service",
        description: "What service do you want to check?",
        required: true,
        choices: [
          {
            name: "cordx.lol",
            value: "prod_site",
          },
          {
            name: "beta.cordx.lol",
            value: "beta_site",
          },
        ],
        type: 3,
      },
    ],
  
    run: async (client) => {
      let method = await client.interaction.options.get("service")?.value;
  
      switch (method) {

        case 'prod_site':

            const prodCheck = new UptimeClient('https://cordx.lol', { timeout: 5000 });

            await client.interaction.reply({
                embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle('Fetching Status')
                    .setColor(client.colors.warning)
                    .setThumbnail(client.loading)
                    .setDescription('Please wait while i attempt to ping the website and check its response time, this may take a few seconds....')
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ]
            });

            await prodCheck._start();

            setTimeout(async () => {

                const start = new Date(prodCheck.startTime);
                const end = new Date(prodCheck.lastSuccessCheck);
                const resTime = (end - start) / 1000;

                await prodCheck._stop();

                return client.interaction.editReply({
                    embeds: [
                        new client.Gateway.EmbedBuilder()
                        .setTitle(`Status of: cordx.lol`)
                        .setColor(client.colors.base)
                        .setThumbnail(client.logo)
                        .setDescription('Here is the response from the website')
                        .addFields({
                            name: 'Status',
                            value: `${prodCheck.available ? '🟢 ONLINE' : '🔴 OFFLINE'}`,
                            inline: false
                        },{
                            name: 'Check Started',
                            value: `${start.toLocaleString()}`,
                            inline: false
                        },{
                            name: 'Check Ended',
                            value: `${end.toLocaleString()}`,
                            inline: false 
                        },{
                            name: 'Response Time',
                            value: `${resTime + ' seconds'}`,
                            inline: false
                        },{
                            name: 'Round Trip',
                            value: `${prodCheck.ping ? prodCheck.ping + 'ms' : 0 + 'ms'}`,
                            inline: false
                        })
                        .setTimestamp()
                        .setFooter({
                            text: client.footer,
                            iconURL: client.logo
                        })
                    ]
                })
            }, 5000)

        break;

        case 'beta_site':

        const betaCheck = new UptimeClient('https://beta.cordx.lol', { timeout: 5000 });

        await client.interaction.reply({
            embeds: [
                new client.Gateway.EmbedBuilder()
                .setTitle('Fetching Status')
                .setColor(client.colors.warning)
                .setThumbnail(client.loading)
                .setDescription('Please wait while i attempt to ping the website and check its response time, this may take a few seconds....')
                .setTimestamp()
                .setFooter({
                    text: client.footer,
                    iconURL: client.logo
                })
            ]
        });

        await betaCheck._start();

        setTimeout(async () => {

            const start = new Date(betaCheck.startTime);
            const end = new Date(betaCheck.lastSuccessCheck);
            const resTime = (end - start) / 1000;

            await betaCheck._stop();

            return client.interaction.editReply({
                embeds: [
                    new client.Gateway.EmbedBuilder()
                    .setTitle(`Status of: beta.cordx.lol`)
                    .setColor(client.colors.base)
                    .setThumbnail(client.logo)
                    .setDescription('Here is the response from the website')
                    .addFields({
                        name: 'Status',
                        value: `${betaCheck.available ? '🟢 ONLINE' : '🔴 OFFLINE'}`,
                        inline: false
                    },{
                        name: 'Check Started',
                        value: `${start.toLocaleString()}`,
                        inline: false
                    },{
                        name: 'Check Ended',
                        value: `${end.toLocaleString()}`,
                        inline: false 
                    },{
                        name: 'Response Time',
                        value: `${resTime + ' seconds'}`,
                        inline: false
                    },{
                        name: 'Round Trip',
                        value: `${betaCheck.ping ? betaCheck.ping + 'ms' : 0 + 'ms'}`,
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({
                        text: client.footer,
                        iconURL: client.logo
                    })
                ]
            })
        }, 5000)


      }
    },
  };