require("module-alias/register");
require("dotenv").config();

const Discord = require("discord.js");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const { log } = require("@plugins/logger/index");
const events = require("@handlers/events/index");
const config = require("@configs/main.config");
const perms = require("@configs/perms.config");
const utils = require("@handlers/discord/presence");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: ["CHANNEL", "REACTION", "GUILD_MEMBER", "MESSAGE", "USER"],
  allowedMentions: {
    repliedUser: true,
    parse: ["roles", "users", "everyone"],
  },
});

module.exports = client;

client.Gateway = Discord;
client.events = events;
client.logger = log;
client.config = config;
client.perms = perms;
client.utils = utils;
client.colors = config.EmbedColors;
client.logo =
  "https://cdn.discordapp.com/attachments/653733403841134600/1133665334101037116/CordX.jpg";
client.glogo =
  "https://cdn.discordapp.com/attachments/653733403841134600/1133665334101037116/CordX.jpg";
client.glogo2 =
  "https://cdn.discordapp.com/attachments/653733403841134600/1133665334101037116/CordX.jpg";
client.ballLogo =
  "https://cdn.discordapp.com/attachments/653733403841134600/1088241600133607515/ezgifcom-gif-maker_8.7b86d9b5eefc.gif";
client.footer = "© Copyright 2023 - CordX";

client.slash = new Collection();
client.aliases = new Collection();
client.category = new Collection();
client.limits = new Map();

events.loadEvents(client);
events.loadSlash(client);

//client.login(config.Discord.Tokens.main)
client.login(config.Discord.Tokens.dev);
