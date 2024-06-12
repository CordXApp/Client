import { SecretEntities } from "@prisma/client"

export interface Create {
    maxUses: number;
    entity: SecretEntities;
    entityId: string;
}

export type Entities = 'User' | 'Organization' | 'Admin';