module.exports = {
    API: {
      domain: 'https://api.cordx.lol/v3/',
      secret: process.env.API_SECRET
    },
    Cordx: {
      Domains: {
        prod: 'https://cordx/lol/',
        beta: 'https://beta.cordx.lol/',
        dev: 'https://dev.cordx.lol/'
      }
    },
    Discord: {
      Tokens: {
        main: process.env.PROD_TOKEN,
        dev: process.env.DEVS_TOKEN
      },
    },
    Database: {
      user: process.env.SQL_USER,
      host: process.env.SQL_HOST,
      pass: process.env.SQL_PASS,
      name: process.env.SQL_NAME
    },
    EmbedColors: {
      base: '#2e004d',
      error: '#FF0000',
      success: '#2BBF00',
      warning: '#D4F30E'
    }
  };