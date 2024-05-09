import {
    users as PrismaUser,
    domains as PrismaDomains,
    signatures as PrismaSignatures,
} from "@prisma/client";

import type { PermissionResolvable } from "discord.js"

export interface User extends PrismaUser {
    avatar: string;
    banner: string;
    username: string;
    globalName: string;
    userid: string;
    secret: string;
    folder: string;
    webhook: string;
    cookie: string;
    owner: boolean;
    admin: boolean;
    staff: boolean;
    banned: boolean;
    verified: boolean;
    developer: boolean;
    domain: string;
    position: string;
    total: number;
    perms?: GatePermissions
}

export interface Domain extends PrismaDomains {
    name: string;
    user: string;
    content: string;
    verified: boolean;
    createdAt: Date;
}

export interface Signature extends PrismaSignatures {
    key: string;
    createdAt: Date;
}

export interface UserConfig {
    Version: string;
    Name: string;
    DestinationType: string;
    RequestMethod: string;
    RequestURL: string;
    Headers: {
        userid: string;
        secret: string;
    },
    Body: string;
    FileFormName: string;
    URL: string;
}

export interface LeaderboardData {
    userid: string;
    username: string;
    globalName: string;
    position: string;
    total: number
}

export interface Perms {
    base?: BasePermissions
    gate?: GatePermissions
}

export interface BasePermissions {
    client?: PermissionResolvable[]
    user?: PermissionResolvable[]
    [key: string]: PermissionResolvable[] | undefined | string
}

export interface GatePermissions {
    owner?: boolean;
    admin?: boolean;
    staff?: boolean;
    banned?: boolean;
    developer?: boolean;
    verified?: boolean;
    [key: string]: boolean | string | undefined
}

export type UserPerms = keyof Perms;

export const RequiredPerms = ['owner', 'admin', 'staff', 'developer', 'verified']

export const TOTAL_UPLOADERS = 5;