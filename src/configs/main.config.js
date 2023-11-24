module.exports = {
  API: {
    domain: "https://api.cordx.lol/v3/",
    secret: process.env.API_SECRET,
  },
  Cordx: {
    Domains: {
      prod: "https://cordx/lol/",
      beta: "https://beta.cordx.lol/",
      dev: "https://dev.cordx.lol/",
    },
  },
  Discord: {
    Tokens: {
      main: process.env.PROD_TOKEN,
      dev: process.env.DEVS_TOKEN,
    },
  },
  EmbedColors: {
    base: "#2e004d",
    error: "#FF0000",
    success: "#2BBF00",
    warning: "#D4F30E",
  },
  Tickets: {
    parentOpened: "1147353355358851072",
    supportRole: "1138246343412953218",
    ticketLogs: "1147354289870745620",
    ticketChan: "1147354004196704356",
  },
};
