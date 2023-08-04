module.exports = {
  Discord: {
    Tokens: {
      main: process.env.PROD_TOKEN,
      dev: process.env.DEVS_TOKEN,
    },
  },
  Database: {
    user: process.env.SQL_USER,
    host: process.env.SQL_HOST,
    pass: process.env.SQL_PASS,
    name: process.env.SQL_NAME,
  },
};
