export type Snowflake = string;

export type DiscordUser = {
    id: Snowflake;
    username?: string;
    global_name?: string;
    discriminator?: string;
    accent_color?: ColorData['accent_color'];
    banner_color?: ColorData['banner_color'];
    created_at?: string;
    avatar?: AvatarData;
    banner?: BannerData;
}

export type ColorData = {
    accent_color: number | any;
    banner_color: number | any;
}

export type AvatarDecorationData = {
    asset: string;
    sku_id: string;
}

export type AvatarData = {
    id: DiscordUser['avatar'];
    link: string;
    is_animated: any;
}

export type BannerData = {
    id: DiscordUser['banner'];
    link: string;
    color: number | null;
    is_animated: any;
}