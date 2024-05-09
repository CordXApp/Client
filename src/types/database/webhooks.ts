import { webhooks as PrismaWebhooks } from '@prisma/client';

export interface Webhook extends PrismaWebhooks {
    id: string;
    token: string;
    name: string;
    enabled: boolean;
}