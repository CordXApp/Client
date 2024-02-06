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
}

export interface Responses {
    success: boolean
    message?: string
    user?: User
    domain?: CustomDomains
}

export interface UserData {
    id: string
    owner: boolean
    admin: boolean
    moderator: boolean
    banned: boolean
    verified: boolean
    beta: boolean
    active_domain: string
    domains: any[]
}