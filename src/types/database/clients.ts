import { Modules } from "../../modules/base.module";
import Logger from "../../utils/logger.util";
import { PrismaClient } from '@prisma/client';
import { DatabaseClient } from "../../prisma/prisma.client";
import type CordX from "../../client/cordx";


export interface Constructor {
    client: CordX,
    db: DatabaseClient,
    prisma: PrismaClient,
    logs: Logger,
    mods: Modules
}