import { Handler, CreateParams, EntityParams, FlaggedOrgNames, Entities, AdditionalParams, GetOrgParams } from "../../../types/database/entities";
import { Responses } from "../../../types/database/index"
import { Constructor } from "../../../types/database/clients";
import { Modules } from "../../../modules/base.module";
import { DatabaseClient } from "../../prisma.client";
import Logger from "../../../utils/logger.util";
import type CordX from "../../../client/cordx";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

export class EntityClient implements Handler {
    private client: CordX
    private logs: Logger;
    private db: DatabaseClient;
    private prisma: PrismaClient;
    private mods: Modules;

    constructor(data: Constructor) {
        this.client = data.client;
        this.logs = data.logs;
        this.db = data.db;
        this.prisma = data.prisma;
        this.mods = data.mods;
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

        return await this.CreateEntity(entityType, entityData);
    }

    public async update(params: EntityParams): Promise<Responses> {
        let requiredParams: string[] = [];
        let entityData: any = null;
        let entityType = '';

        switch (params.entity) {
            case 'User':
                requiredParams = ['avatar', 'banner', 'username', 'globalName'];
                entityData = params.user;
                entityType = 'User';
                break;
            case 'Organization':
                requiredParams = ['name', 'logo', 'banner', 'description', 'owner'];
                entityData = params.org;
                entityType = 'Organization';
                break;
            default:
                return { success: false, message: 'Unsupported entity provided' }
        }

        if (!entityData) return {
            success: false,
            message: `Please provide a valid ${entityType} field to update!`
        }

        const validation = await this.CheckRequiredParams(entityData, requiredParams);

        if (!validation.success) return {
            success: false,
            message: validation.message
        };

        return await this.UpdateEntity(entityType, entityData.id as string, entityData);
    }

    public async exists(params: AdditionalParams): Promise<boolean> {
        let query: any = {};

        const handlers = {
            'User': async (query: any) => await this.db.prisma.users.findUnique({ where: query }),
            'Organization': async (query: any) => await this.db.prisma.orgs.findUnique({ where: query })
        };

        if (params.id) query = { id: params.id };
        else if (params.userid) query = { userid: params.userid };
        else return false;

        const handler = handlers[params.entity];

        if (!handler) return false;

        const result = await handler(query);

        return !!result;
    }

    public async fetch(params: AdditionalParams): Promise<Responses> {
        let query: any = {};

        if (params.id) query = { id: params.id };
        else if (params.userid) query = { userid: params.userid };
        else return { success: false, message: `No valid identifier provided!` }

        switch (params.entity) {

            case 'User': {
                const user = await this.prisma.users.findUnique({ where: query });
                return user ? { success: true, data: user } : { success: false, message: `Unable to locate a user with the provided ID` };
            }

            case 'Organization': {
                const org = await this.prisma.orgs.findUnique({ where: query });
                return org ? { success: true, data: org } : { success: false, message: 'Unable to locate a org with the provided ID' };
            }

            default: return { success: false, message: 'Unsupported entity provided!' };
        }
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


    public async getOrg(params: GetOrgParams): Promise<Responses> {
        if (!params.id && !params.name) return { success: false, message: 'Please provide a valid identifier!' }

        const org = await this.prisma.orgs.findFirst({
            where: {
                id: params.id ? params.id : undefined,
                name: params.name ? params.name : undefined
            },
            include: { members: true, links: true, domains: true }
        });


        return org ? { success: true, data: org } : { success: false, message: 'Unable to locate that organization' };
    }

    private async CheckRequiredParams(data: any, required: string[]): Promise<Responses> {
        const missing = required.filter((key) => !data[key]);

        if (missing.length > 0) return {
            success: false,
            message: `Missing required fields: ${missing.join(', ')}`
        }

        return { success: true }
    }


    /**
     * Create a new entity
     * @param entity The entity to create (User, Organization)
     * @param entityData The data to post for the entity!
     * @returns { Promise<Responses> } { success: boolean, message: string, data?: any }
     */
    private async CreateEntity(entity: string, entityData: any): Promise<Responses> {
        const exists = await this.exists({ id: entityData.id, entity: entity as Entities });

        if (exists) return {
            success: false,
            message: `${entity} entity with ID: ${entityData.id} already exists`
        }

        if (entity === 'Organization') {
            const test = await this.prisma.orgs.findFirst({ where: { name: entityData.name } });

            if (FlaggedOrgNames.includes(entityData.name) && entityData.owner !== '510065483693817867') return {
                success: false,
                message: `The name ${entityData.name} is not allowed!`
            }

            if (test) return { success: false, message: `A ${entity} entity already exists with that name.` }
        }

        const entityModelName = this.mapEntityToModelName(entity);

        const created = await this.prisma[entityModelName].create({
            data: { ...entityData }
        }).catch((err: Error) => {
            this.logs.error(`Error creating ${entity} entity: ${err.message}`);
            this.logs.debug(err.stack as string);

            return {
                success: false,
                message: `Failed to create ${entity} entity: ${err.message}`
            }
        });

        const secret = await this.db.secret.model.create({
            maxUses: 5000,
            entity: entity as Entities,
            entityId: entityData.id
        })

        if (!secret.success) return {
            success: false,
            message: secret.message
        }

        return { success: true, data: created }
    }

    private async UpdateEntity(entity: string, entityId: string, entityData: any): Promise<Responses> {
        const exists = await this.exists({ id: entityId, entity: entity as Entities });

        if (!exists) return {
            success: false,
            message: `Unable to locate a ${entity} entity with ID: ${entityId}!`
        };

        const entityModelName = this.mapEntityToModelName(entity);

        const updated = await this.prisma[entityModelName].update({
            where: { id: entityId },
            data: { ...entityData }
        }).catch((err: Error) => {
            this.logs.error(`Error updating ${entity} entity: ${err.message}`);
            this.logs.debug(err.stack as string)

            return {
                success: false,
                message: `Failed to update ${entity} entity: ${err.message}`
            }
        })

        return { success: true, data: updated }
    }

    private mapEntityToModelName(entity: string): string {
        const entityModelMap: { [key: string]: string } = {
            'User': 'users',
            'Organization': 'orgs'
        }

        return entityModelMap[entity] || entity.toLowerCase()
    }

    private ValidateEntityType(entity: string): boolean {
        const valid = ['User', 'Organization']

        return valid.includes(entity);
    }
}
