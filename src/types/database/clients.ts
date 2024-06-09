import { Modules } from "../../modules/base.module";
import Logger from "../../utils/logger.util";
import { PrismaClient } from '@prisma/client';
import type CordX from "../../client/cordx";


export interface Constructor {
    client: CordX,
    prisma: any,
    logs: Logger,
    mods: Modules
}