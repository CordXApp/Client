import { FlaggedOrgNames, Entities, AdditionalParams, Query } from "../../../types/database/entities";
import { Responses } from "../../../types/database/index"
import { Constructor } from "../../../types/database/clients";
import { Modules } from "../../../modules/base.module";
import { DatabaseClient } from "../../prisma.client";
import Logger from "../../../utils/logger.util";
import type CordX from "../../../client/cordx";
import { PrismaClient } from "@prisma/client";

export class EntityFunctions {
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

    /**
     * Validate parameters and check if any are missing
     * @param data The data to check for params in
     * @param required The required params
     */
    public async CheckRequiredParams(data: any, required: string[]): Promise<Responses> {
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
    public async CreateEntity(entity: string, entityData: any): Promise<Responses> {
        const exists = await this.db.entity.exists({ entity: entity as Entities, entityId: entityData.id })

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

    public async UpdateEntity(params: AdditionalParams): Promise<Responses> {
        let query: any = {};

        if (params.entity === 'Organization') query = { id: params.entityId };
        else if (params.entity === 'User') query = { userid: params.entityId };
        else return { success: false, message: `No valid identifier provided!` }

        const exists = await this.db.entity.exists({ entity: params.entity, entityId: params.entityId });

        if (!exists) return {
            success: false,
            message: `Unable to locate a ${params.entity} entity with the ID: ${params.entityId}`
        }

        const entityToModelName = this.mapEntityToModelName(params.entity);

        const updated = await this.prisma[entityToModelName].update({
            where: query,
            data: { ...params.entityData }
        }).catch((err: Error) => {
            this.logs.error(`Error updating ${params.entity} entity: ${err.message}`);
            this.logs.debug(err.stack as string)

            return {
                success: false,
                message: `Failed to update ${params.entity} entity: ${err.message}`
            }
        })

        return { success: true, data: updated }
    }

    public mapEntityToModelName(entity: string): string {
        const entityModelMap: { [key: string]: string } = {
            'User': 'users',
            'Organization': 'orgs'
        }

        return entityModelMap[entity] || entity.toLowerCase()
    }

    public ValidateEntityType(entity: string): boolean {
        const valid = ['User', 'Organization']

        return valid.includes(entity);
    }

    public async fetchUser(userId: string): Promise<Responses> {
        const user = await this.prisma.users.findUnique({
            where: { userid: userId },
            include: {
                domains: true,
                uploads: true,
                signature: true,
                org_members: true,
                permissions: true,
                orgs: true
            }
        });

        if (!user) return { success: false, message: `Unable to locate a user with the ID: ${userId}` };

        return { success: true, data: user };
    }

    public async fetchOrg(orgId: string): Promise<Responses> {
        const org = await this.prisma.orgs.findUnique({
            where: { id: orgId },
            include: {
                links: true,
                members: true,
                domains: true,
                uploads: true
            }
        });

        if (!org) return { success: false, message: `Unable to locate a org with the ID: ${orgId}` }

        return { success: true, data: org }
    }
}
