import { FastifyReply, FastifyRequest } from "fastify";
import { Entities } from "../database/entities";

export interface HandleUploadParams {
    req: FastifyRequest;
    res: FastifyReply;
    file?: any;
    files?: any;
    secret?: string;
    entity?: Entities;
    entityId?: string;
    fileId?: string;
    mime?: string;
    data?: any;
}

export interface HandleDeleteParams {
    req: FastifyRequest;
    res: FastifyReply;
    userid: string;
    secret: string;
    fileid: string;
}