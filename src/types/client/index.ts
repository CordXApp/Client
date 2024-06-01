import type { BitFieldResolvable, GatewayIntentsString } from "discord.js"

export interface IConfig {
    intents: BitFieldResolvable<GatewayIntentsString, number>
    restVersion: "10" | "9"
    API: {
        domain: "https://api.cordx.lol"
        secret: string
    }
    Cordx: {
        proxy: "https://proxy.cordx.lol"
        domain: "https://cordximg.host"
        docs: "https://help.cordx.lol"
    }
    Icons: {
        loading: string
        eightBall: string;
    }
    Discord: {
        mainToken: string
        devToken: string
    }
    EmbedColors: {
        base: "#2e004d"
        error: "#FF0000"
        success: "#2BBF00"
        warning: "#D4F30E"
    }
}

export interface IHelpConfig {
    prefix: string
    images: {
        domValidation: string;
    }
    spellCheck: string[]
}

export interface Cooldown {
    ms: number;
    command: string;
    user: string;
}