import { GatePermissions } from "../database/users";

export interface PermsClient {
    get user(): {
        has: (opts: Params) => Promise<boolean>;
        list: (user: string) => Promise<Response>;
        missing: (opts: Params) => Promise<string[]>;
        update: (opts: Params) => Promise<Response>;
        remove: (opts: Params) => Promise<boolean>;
    }
}

export interface Params {
    user: string;
    perm: GatePermissions | GatePermissions[] | []
}

export interface Response {
    success: boolean;
    message?: string;
    missing?: string | string[];
    data?: string | string[] | any;
}