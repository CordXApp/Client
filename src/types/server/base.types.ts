import CordX from "../../client/CordX";

export interface Client {
    client: CordX;
    options: {
        port: number;
        host: '0.0.0.0'
    }

}

export interface Params {
    url: string;
    method: string;
    schema?: any;
    preHandler: any;
    handler: any;
    config?: any;
}

export interface Router {
    summary: string;
    description: string;
    security?: any[];
    response: any;
    params?: any;
    querystring?: any;
    body?: any;
    tags: string[];
}

