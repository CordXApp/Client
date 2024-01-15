export interface UserStats {
    storage: UserStorageStats;
    files: UserFileStats;
}

export interface UserStorageStats {
    used: string;
    remains: string;
}

export interface UserFileStats {
    images: number;
    downloads: number;
    png: number;
    gif: number;
    mp4: number;
    other: number;
}