import { GatePermissions } from "./users";

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