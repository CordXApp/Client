import { partners as PrismaPartners } from "@prisma/client";

export interface Partner extends PrismaPartners {
    name: string;
    image: string;
    bio: string;
    url: string;
    social: string;
}

export interface Params {
    name: string;
    logo: string;
    banner: string;
    owner: string;
    about: string;
    discord: string;
    website: string;
    twitter: string;
}