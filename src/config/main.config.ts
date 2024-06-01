import type { IConfig } from "src/types/client"

const config: IConfig = {
    API: {
        domain: "https://api.cordx.lol/v3/",
        secret: `${process.env.API_SECRET}`,
    },
    Cordx: {
        proxy: "https://proxy.cordx.lol",
        domain: "https://cordximg.host",
        docs: "https://help.cordx.lol",
    },
    Icons: {
        loading:
            "https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif",
        eightBall: "https://cdn.discordapp.com/attachments/653733403841134600/1088241600133607515/ezgifcom-gif-maker_8.7b86d9b5eefc.gif"
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
        "MessageContent",
        "GuildModeration",
    ],
}

export default config
