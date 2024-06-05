import Logger from "../../utils/logger.util"
import { EventEmitter } from "events";

export interface SpacesClient {
    emitter: EventEmitter;
    logs: Logger;
    user: SpacesUser;
    actions: SpacesAction;
}

export interface SpacesResponse {
    success: boolean
    message?: string
    percentage?: number
    data?: any
}

export interface EmitterResponse {
    results: SpacesResponse
}

export interface SpacesUser {
    list(user: string): void;
    size(user: string): void;
}

export interface UserContent {
    drop(opts: DropContentOpts): Promise<SpacesResponse>;
    update(opts: UpdateContentOpts): Promise<SpacesResponse>;

}

export interface DropContentOpts {
    user: string;
    force: boolean;
}

export interface UpdateContentOpts {
    user: string;
    force: boolean;
}

export interface SpacesAction {
    sync_user(user: string, force: boolean): Promise<EmitterResponse>
    sync_all(force: boolean): Promise<EmitterResponse>
    check(user: string): Promise<SpacesResponse>
}

export interface File {
    Key: string;
    LastModified: Date;
    ETag: string;
    Size: number;
}

export interface BucketData {
    Contents: File[]
}

export interface FileObj {
    success: boolean;
    message?: string;
    results?: any;
    data?: File[]
}