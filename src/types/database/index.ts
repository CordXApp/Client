import { User } from "./users";
import { Webhook } from "./webhooks";
import { Params } from "./partners";

export interface UserMethods {
    create: (data: User) => Promise<Responses>
    exists: (id: User['userid']) => Promise<Boolean>
    fetch: (id: User['userid']) => Promise<Responses>
    update: (id: User['userid'], data: User) => Promise<Responses>
    delete: (id: User['userid']) => Promise<Responses>
    profile: (id: User['userid']) => Promise<Responses>
    staff: () => Promise<Responses>
    syncRoles: () => Promise<void>
    syncPerms: () => Promise<void>
}

export interface WebhookMethods {
    create: (data: Webhook) => Promise<Responses>
    exists: (id: Webhook['id']) => Promise<Boolean>
    fetch: (id: Webhook['id']) => Promise<Responses>
    update: (id: Webhook['id'], data: Webhook) => Promise<Responses>
    delete: (id: Webhook['id']) => Promise<Responses>
}

export interface PartnerMethods {
    create?: (data: Params) => Promise<Responses>
}

export interface StatsMethods {
    images: () => Promise<Responses>
    users: () => Promise<Responses>
    domains: () => Promise<Responses>
    leaderboard: (amount: number) => Promise<Responses>
}

export interface Responses {
    success: boolean
    message?: string
    percentage?: number
    missing?: any
    data?: any
}