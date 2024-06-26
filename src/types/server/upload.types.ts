import { FastifyReply, FastifyRequest } from "fastify";

export interface HandleUploadParams {
    req: FastifyRequest;
    res: FastifyReply;
    files: any;
    secret?: string;
    userid: string;
}

export interface HandleDeleteParams {
    userid: string;
    secret: string;
    fileid: string;
}