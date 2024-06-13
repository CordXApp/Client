import { Handler, CreateParams, EntityParams, Entities, AdditionalParams } from "../../../types/database/entities";
import { Responses } from "../../../types/database/index"
import { EntityFunctions } from "./entity.functions";
import { Constructor } from "../../../types/database/clients";
import { Modules } from "../../../modules/base.module";
import { DatabaseClient } from "../../prisma.client";
import Logger from "../../../utils/logger.util";
import type CordX from "../../../client/cordx";
import { PrismaClient } from "@prisma/client";

export class EntityClient implements Handler {
    private client: CordX
    private logs: Logger;
    private db: DatabaseClient;
    private prisma: PrismaClient;
    private mods: Modules;
    public func: EntityFunctions;

    constructor(data: Constructor) {
        this.client = data.client;
        this.logs = data.logs;
        this.db = data.db;
        this.prisma = data.prisma;
        this.mods = data.mods;

        this.func = new EntityFunctions({
            client: this.client,
            logs: this.logs,
            db: this.db,
            prisma: this.prisma,
            mods: this.mods,
        })
    }

    public async create(params: CreateParams): Promise<Responses> {
        let requiredParams: string[] = [];
        let entityData;
        let entityType = '';

        switch (params.entity) {

            case 'User':
                requiredParams = ['userid', 'avatar', 'banner', 'username', 'globalName', 'folder'];
                entityData = params.user;
                entityType = 'User';
                break;
            case 'Organization':
                requiredParams = ['id', 'name', 'logo', 'banner', 'description', 'owner', 'webhook', 'domain'];
                entityData = params.org;
                entityType = 'Organization'
                break
            default: {
                return {
                    success: false,
                    message: 'Unsupported entity provided!'
                }
            }
        }

        if (!entityData) return {
            success: false,
            message: `Please provide a valid ${entityType} object`
        }

        const validation = await this.func.CheckRequiredParams(entityData, requiredParams);

        if (!validation.success) {
            return {
                success: false,
                message: validation.message
            };
        }

        return await this.func.CreateEntity(entityType, entityData);
    }

    public async update(params: EntityParams): Promise<Responses> {
        let requiredParams: string[] = [];
        let entityData: any = null;
        let entityType: string;

        switch (params.entity) {
            case 'User':
                requiredParams = ['userid', 'avatar', 'banner', 'username', 'globalName'];
                entityData = params.user;
                entityType = 'User'
                break;
            case 'Organization':
                requiredParams = ['name', 'logo', 'banner', 'description', 'owner'];
                entityData = params.org;
                entityType = 'Organization'
                break;
            default:
                return {
                    success: false,
                    message: 'Unsupported entity provided'
                }
        };

        if (!entityData) {
            return {
                success: false,
                message: `Please provide a valid ${entityType} object`
            };
        }

        const validation = await this.func.CheckRequiredParams(entityData, requiredParams);

        if (!validation.success) {
            return {
                success: false,
                message: validation.message
            };
        }

        const entityId = entityType === 'User' ? entityData.userid : entityData.id;
        return await this.func.UpdateEntity({ entity: entityType as Entities, entityId });
    }

    public async exists(params: AdditionalParams): Promise<boolean> {
        let query: any = {};

        const handlers = {
            'User': async (query: any) => await this.db.prisma.users.findUnique({ where: query }),
            'Organization': async (query: any) => await this.db.prisma.orgs.findUnique({ where: query })
        };

        if (params.entity === 'Organization') query = { id: params.entityId };
        else if (params.entity === 'User') query = { userid: params.entityId };
        else return false;

        const handler = handlers[params.entity];

        if (!handler) return false;

        const result = await handler(query);

        return !!result;
    }

    public async fetch(params: AdditionalParams): Promise<Responses> {

        if (params.entity === 'User') return this.func.fetchUser(params.entityId as string);
        else if (params.entity === 'Organization') return this.func.fetchOrg(params.entityId as string);

        else return { success: false, message: `Invalid entity or identifier provided!` };
    }

    public async delete(entity: Entities, id: string): Promise<Responses> {
        switch (entity) {

            case 'User': {
                const user = await this.prisma.users.delete({ where: { id } });
                return user ? { success: true, data: user } : { success: false, message: 'User entity not found!' };
            }

            case 'Organization': {
                const org = await this.prisma.orgs.delete({ where: { id } });
                return org ? { success: true, data: org } : { success: false, message: 'Organization entity not found!' };
            }

            default: return { success: false, message: 'Unsupported entity provided!' };
        }
    }
}
