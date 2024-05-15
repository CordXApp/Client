export interface DomainConfig {
    blacklist: string[]
}

export const IP_ADDRESS_ERROR = 'IP Addresses are not supported at this time!';
export const INVALID_DOMAIN_ERROR = 'Invalid domain provided, check your params and try again!';
export const INVALID_PATTERN_ERROR = 'Invalid domain pattern provided!';
export const ESCAPE_SEQUENCE_ERROR = 'Escape sequences are not allowed in any domain name!';
export const PROTOCOL_ERROR = 'Protocol not required please update your params (ex: cdn.cordx.lol)';
export const BLACKLIST_ERROR = 'Whoops, you are attempting to use a domain that contains either a blacklisted root or sub domain.'
export const SUCCESS_MESSAGE = 'Domain follows our regex standards!';

export const BLACKLIST_KEYWORDS = [
    'localhost',
    'cordx',
    'devhub',
    'discord',
    'discordbots',
    'discordbot',
    'discordextremelist',
    'discordlistology',
    'discordlist',
    'makesmehorny',
    'infinitybots',
    'botlist'
]