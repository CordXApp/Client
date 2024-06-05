import type { BitFieldResolvable, CollectorFilter, ComponentType, GatewayIntentsString, MessageComponentInteraction, Message, CacheType } from "discord.js"
import CordX from "../../client/cordx";

export interface IConfig {
    intents: BitFieldResolvable<GatewayIntentsString, number>
    restVersion: "10" | "9"
    API: {
        domain: "https://demonstride.cordx.lol"
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

export interface CordXCollector {
    client: CordX;
    message: any;
    filter: CollectorFilter<[MessageComponentInteraction<CacheType>]>;
    options: CollectorOptions;
}

export interface CollectorOptions {
    action: ActionType;
    customIds: ActionCustomIds[];
    componentType: ComponentType
    force?: boolean;
    time: number;
}

export type ActionType = 'bucketSync' | 'helpMenu';
export type ActionCustomIds = 'agree' | 'disagree' | 'continue' | 'back' | 'next';