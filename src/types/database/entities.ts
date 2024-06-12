import { Responses } from "./index";
import { users, orgs } from "@prisma/client";

export interface Handler {
    /**
     * Create a new entity!
     * @param params EntityParams
     * @param params.entity The entity to create (User, Organization)
     * @param params.user The user to create (optional)
     * @param params.org The organization to create (optional)
     * @returns { Promise<Responses> }
     */
    create: (params: CreateParams) => Promise<Responses>
    /**
     * Update an existing entity
     * @param params.entity The entity to create (User, Organization)
     * @param params.user The user to update (optional)
     * @param params.org The org to update (optional)
     * @returns { Promise<Responses> }
     */
    update: (params: EntityParams) => Promise<Responses>
    /**
     * Delete an existing entity
     * @param entity The entity to delete (User, Organization)
     * @param id The Cornflake of the entity to delete
     * @returns { Promise<Responses> }
     */
    delete: (entity: Entities, id: string) => Promise<Responses>
    /**
     * Fetch an organization
     * @param id The Cornflake of the organization to fetch
     * @returns { Promise<Responses> }
     */
    getOrg: (params: GetOrgParams) => Promise<Responses>
    /**
     * Check if an entity exists
     * @param entity The entity to validate (User, Organization)
     * @param id The Cornflake of the entity to validate
     * @returns boolean
     */
    exists: (params: AdditionalParams) => Promise<boolean>
    /**
     * Fetch an entity
     * @param entity The entity to fetch (User, Organization)
     * @param id The Cornflake of the entity to fetch
     * @returns { Promise<Responses> }
     */
    fetch: (params: AdditionalParams) => Promise<Responses>
}

export interface CreateParams {
    entity: Entities;
    user?: User;
    org?: Org;
}

export interface GetOrgParams {
    id?: string;
    name?: string;
}

export interface EntityParams {
    entity: Entities;
    user?: User;
    org?: Org;
}

export interface AdditionalParams {
    id?: string;
    userid?: string;
    entity: Entities;
}

export interface User {
    id?: string;
    userid?: string;
    avatar?: string;
    banner?: string;
    username?: string;
    globalName?: string;
    folder?: string;
    webhook?: string;
    domain?: string;
}

export interface Org {
    id?: string;
    name?: string;
    logo?: string;
    banner?: string;
    description?: string;
    webhook?: string;
    domain?: string;
    owner?: string;
}

export type Entities = 'User' | 'Organization';

export const FlaggedOrgNames = [
    'cordx',
    'CordX',
    'infinitylist',
    'infinity list',
    'infinity bots',
    'infinitybots',
    'infinity bot list',
    'infinitybotlist',
    'diswidgets',
    'dis widgets',
    'job cord',
    'jobcord'
];