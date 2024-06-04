import { reports, notes } from "@prisma/client";

export interface Report {
    id?: string;
    type: reports['type'];
    author: string;
    reason: string;
    status?: reports['status'];
    notes?: notes[]
    mod?: string;
    createdAt?: Date;
    updatedAt?: Date;
}