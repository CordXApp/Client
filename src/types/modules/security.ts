export interface SecurityClient {
    get init(): {
        encrypt: (data: string) => Promise<string>;
        decrypt: (data: string) => Promise<string>;
        partial: (data: string) => Promise<string>;
    }
}