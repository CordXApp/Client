export interface GetDiscordUser {
    userId: string;
    secret?: string;
    domain?: string;
}

export interface NewEntitySecret {
    entity: 'Admin' | 'User' | 'Organization';
    userId?: string;
    orgId?: string;
    maxUses?: number;
}