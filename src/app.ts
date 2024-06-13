import { config as insertEnv } from "dotenv"
import { Partials } from "discord.js"
import CordX from "./client/cordx"
import config from "./config/main.config"

insertEnv()

const client: CordX = new CordX({
    intents: config.intents,
    partials: [
        Partials.User,
        Partials.Message,
        Partials.GuildMember,
        Partials.Channel,
        Partials.Reaction
    ],
    allowedMentions: {
        parse: ["users", "roles", "everyone"],
        repliedUser: true
    },
})

client.authenticate(process.env.TOKEN!)
