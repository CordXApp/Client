import { HTTPMethods } from "fastify";
import CordX from "../../client/cordx";

export interface Client {
    client: CordX;
    options: {
        port: number;
        host: '0.0.0.0'
    }

}

export interface Router {
    url: string;
    method: HTTPMethods | HTTPMethods[];
    handler: any;
    preHandler?: any;
    schema?: Schema;
    config?: any;
}

export interface Schema {
    summary: string;
    description: string;
    headers?: any;
    security?: any[];
    response: any;
    params?: any;
    querystring?: any;
    body?: any;
    tags: string[];
}

