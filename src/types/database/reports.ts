import { reports } from "@prisma/client";

export interface Report {
    id?: string;
    type: reports['type'];
    author: string;
    reason: string;
    status?: reports['status'];
    mod?: string;
    createdAt?: Date;
    updatedAt?: Date;
}