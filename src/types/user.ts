export interface User {
    id: number
    owner: boolean
    admin: boolean
    moderator: boolean
    banned: boolean
    verified: boolean
    beta: boolean
    active_domain: string
    domains: CustomDomains[]
    res?: Responses
}

export interface CustomDomains {
    name: string
    txtContent: string
    verified: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Responses {
    success: boolean
    message?: string
    user?: User
    domain?: CustomDomains
}

export interface UserData {
    id: number
    userId: string
    avatar: string
    banner: string
    username: string
    globalName: string
    owner: boolean
    admin: boolean
    moderator: boolean
    developer: boolean
    support: boolean
    banned: boolean
    verified: boolean
    beta: boolean
    active_domain: string
    domains: CustomDomains[]
    signature: UserSignature
}

export interface UserSignature {
    key: string
    createdAt: Date
    updatedAt: Date
}