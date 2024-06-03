import { partners as PrismaPartners } from "@prisma/client";

export interface Partner extends PrismaPartners {
    name: string;
    image: string;
    bio: string;
    url: string;
    social: string;
}