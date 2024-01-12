import type { IConfig  } from 'src/types/utils.interface';

const config: IConfig = {
    API: {
        domain: 'https://api.cordx.lol/v3/',
        secret: `${process.env.API_SECRET}`
    },
    Cordx: {
        domain: 'https://cordx.lol',
        docs:  'https://help.cordx.lol'
    },
    Discord: {
        mainToken: `${process.env.PROD_TOKEN}`,
        devToken: `${process.env.DEV_TOKEN}`
    },
    EmbedColors: {
        base: "#2e004d",
        error: "#FF0000",
        success: "#2BBF00",
        warning: "#D4F30E",
    },
    restVersion: '10',
    intents: [
        'Guilds',
        'GuildMembers',
        'GuildBans',
        'GuildMessages',
        'GuildMessageReactions',
        'GuildMessageTyping',
        'DirectMessages',
        'DirectMessageReactions',
        'DirectMessageTyping',
        'MessageContent',
        'GuildModeration' 
    ]
}

export default config;

