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

export interface SyncAll {
    synced: number;
    skipped: number;
    deleted: number;
    failed: number;
    users: number;
    muser: number;
}

export interface SyncBucket {
    synced: number;
    skipped: number;
    deleted: number;
    failed: number;
    total: number;
}