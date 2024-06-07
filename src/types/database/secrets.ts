import { SecretEntities } from "@prisma/client"

export interface Create {
    maxUses: number;
    entity: SecretEntities;
    userId?: string;
    orgId?: string;
}

export type Entities = 'User' | 'Organization' | 'Admin';