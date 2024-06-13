import { ErrTypes, ErrStates } from "@prisma/client";

export interface Throw {
    message: string;
    opts: ThrowOpts;
}

export interface ThrowOpts {
    id?: string;
    state: ErrStates;
    type: ErrTypes;
    status: string;
    message: string;
    reporter: string;
    error_obj: ErrorObject;
    createdAt?: string;
    updatedAt?: string;
}

export interface Snaily extends Error {
    state: ErrStates;
    type: ErrTypes;
    status: string;
    message: string;
    reporter: string;
    error_obj: ErrorObject;
    createdAt?: string;
    updatedAt?: string;
}

export interface ErrorObject {
    info: string;
    trace: string;
    stack: string;
}

export interface WebhookParams {
    id: string;
    state: ErrStates;
    type: ErrTypes;
    status: string;
    reporter: string;
    message: string;
    error_obj: ErrorObject
}