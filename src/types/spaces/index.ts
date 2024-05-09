import { SyncAll, SyncBucket } from "./files";
import CordXClient from "../../client/cordx";
import Logger from "../../utils/logger.util"
import { EventEmitter } from "events";

export interface SpacesClient {
    client: CordXClient;
    emitter: EventEmitter;
    logs: Logger;
    user: SpacesUser;
    actions: SpacesAction;
}

export interface SpacesUser {
    list(user: string): void;
    size(user: string): void;
}

export interface UserContent {
    drop(opts: DropContentOpts): Promise<SpacesResponse>;

}

export interface DropContentOpts {
    user: string;
    file?: string;
    all?: boolean;
}

export interface SpacesAction {
    sync_user(user: string): Promise<{ results: SyncBucket }>
    sync_all(): Promise<{ results: SyncAll }>
}

export interface SpacesResponse {
    success: boolean;
    message?: string;
    data?: any;
}