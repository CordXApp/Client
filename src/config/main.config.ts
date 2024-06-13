import type { IConfig } from "../types/client"

const config: IConfig = {
    API: {
        domain: "https://demonstride.cordx.lol",
        secret: `${process.env.API_SECRET}`,
    },
    Cordx: {
        proxy: "https://proxy.cordx.lol",
        domain: "https://cordximg.host",
        docs: "https://help.cordx.lol"
    },
    Icons: {
        loading:
            "https://cdn.cordx.space/assets/loading.gif",
        eightBall: "https://cdn.cordx.space/assets/8ball.gif"
    },
    Discord: {
        mainToken: `${process.env.PROD_TOKEN}`,
        devToken: `${process.env.DEV_TOKEN}`,
    },
    EmbedColors: {
        base: "#2e004d",
        error: "#FF0000",
        success: "#2BBF00",
        warning: "#D4F30E",
    },
    restVersion: "10",
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildBans",
        "GuildMessages",
        "GuildMessageReactions",
        "GuildMessageTyping",
        "DirectMessages",
        "DirectMessageReactions",
        "DirectMessageTyping",
        "GuildModeration",
        "MessageContent"
    ],
}

export default config
