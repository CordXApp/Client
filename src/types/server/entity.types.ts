import { User, Org } from "../database/entities";

export interface FetchEntity {
    type: 'user' | 'org';
    id: string;
}

export interface CreateEntityQuery {
    entity: 'user' | 'org';
}

export interface CreateEntityBody {
    user: User;
    org: Org;
}