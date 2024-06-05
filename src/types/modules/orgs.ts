import { Responses } from "../database"

/**
 * Typings for user organizations.
 * @method create Create a new organization
 * @method update Update an organization
 * @method delete Delete an organization
 * @method admin Update the verification/ban status (admin only)
 */
export interface Organizations {
    create(opts: Options): Promise<Responses>
    view(id: string): Promise<Responses>
    list(user: string): Promise<Responses>
    update(opts: Options): Promise<Responses>
    delete(id: string): Promise<Responses>
    admin(opts: AdminOpts): Promise<Responses>
}

/**
 * Typings for organization members.
 * @method add Add a member to an organization
 * @method remove Remove a member from an organization
 */
export interface OrganizationMembers {
    add(opts: Members): Promise<Responses>
    view(org: string): Promise<Responses>
    remove(opts: Members): Promise<Responses>
    hasPerms(perms: ValidPerms[], perm: string): boolean,
    getPerms(org: string, user: string): Promise<Responses>
    updatePerms(org: string, user: string, perm: ValidPerms, executor: string): Promise<Responses>
}

/**
 * Typings for organization links.
 * @method add Add links to an organization
 * @method update Update links for an organization
 * @method remove Remove links from an organization
 */
export interface OrganizationLinks {
    add(opts: Links): Promise<Responses>
    update(opts: Links): Promise<Responses>
    remove(id: string): Promise<Responses>
}

export interface OrganizationDomain {
    add(opts: Domain): Promise<Responses>
    remove(id: string): Promise<Responses>
}

export interface Organization {
    id: string
    name: string
    logo: string
    banner: string
    description: string
    owner: string
    api_key: string
    verified: boolean
    banned: boolean
    domain: string
}

export interface AdminOpts {
    id: string;
    verified: boolean;
    banned: boolean;
}

export interface Options {
    id?: string
    name?: string
    logo?: string
    banner?: string
    description?: string
    owner?: string
    api_key?: string
    verified?: boolean
    banned?: boolean
    domain?: string
    [key: string]: string | boolean | undefined
}

export interface Links {
    discord: string;
    twitter: string;
    github: string;
    instagram: string;
    youtube: string;
    website: string;
}

export interface Members {
    org?: string;
    roles?: Roles;
    userid: string;
}


export interface Roles {
    admin: boolean;
    editor: boolean;
    reader: boolean;
    member: string;
}

export interface Domain {
    name: string;
    content: string;
    verified: boolean;
}

export interface Permissions {
    namespace: Namespaces;
    permission: PermNames;
}

export const AllowedProviders = ['cdn.discord.com', 'i.imgur.com', 'cordx.lol', 'cordximg.host', 'cordx.space', 'cdn.infinitybots.gg', 'cdn.netsocial.app', 'cdn.netsocial.co.in', 'images.topiclist.xyz'];
export const ValidPermsConst = ['global.*', 'org.update', 'org_member.add', 'org_member.delete', 'org_member.update', 'org_links.add', 'org_links.update', 'org_links.delete', 'org_domain.add', 'org_domain.delete', 'org_domain.update']
export type ValidPerms = 'global.*' | 'org.update' | 'org_member.add' | 'org_member.delete' | 'org_member.update' | 'org_links.add' | 'org_links.update' | 'org_links.delete' | 'org_domain.add' | 'org_domain.delete' | 'org_domain.update'
export type Namespaces = 'global' | 'org' | 'org_member' | 'org_links' | 'org_domain'
export type PermNames = '*' | 'add' | 'update' | 'delete'