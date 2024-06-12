import { UserMethods, Responses } from "../../../types/database/index"
import { GatePermissions, User } from "../../../types/database/users";
import { Constructor } from "../../../types/database/clients";
import { DatabaseClient } from "../../prisma.client";
import { Modules } from "../../../modules/base.module";
import Logger from "../../../utils/logger.util";
import type CordX from "../../../client/cordx";
import { PrismaClient, users } from "@prisma/client";
import { randomBytes } from "node:crypto";

export class UserClient {
    private client: CordX;
    private logs: Logger;
    private prisma: PrismaClient;
    private db: DatabaseClient;
    private mods: Modules;

    constructor(data: Constructor) {
        this.client = data.client;
        this.logs = data.logs;
        this.prisma = data.prisma;
        this.db = data.db;
        this.mods = data.mods;
    }

    public get model(): UserMethods {
        return {
            profile: async (id: User['userid']): Promise<Responses> => {

                const user = await this.client.db.prisma.users.findUnique({
                    where: { userid: id },
                    include: {
                        domains: true,
                        permissions: true
                    }
                });

                if (!user) return { success: false, message: 'Unable to locate that user in our database.' };

                return { success: true, data: user }
            },
            staff: async (): Promise<Responses> => {

                const usersWithPerms: any = [];

                const staff = await this.client.db.prisma.users.findMany({ include: { permissions: true } });

                if (!staff) return { success: false, message: 'No staff members found in our database.' };

                for (const user of staff) {

                    if (user.permissions && user.permissions.length > 0) {
                        usersWithPerms.push({
                            id: user.userid as string,
                            avatar: user.avatar as string,
                            banner: user.banner as string,
                            username: user.username as string,
                            globalName: user.globalName as string,
                            permissions: user.permissions.map(perm => perm.name as string)
                        });
                    }
                }

                return { success: true, data: usersWithPerms }
            },
            /**
             * Automated action that runs on client ready to sync beta members with our DB.
             * @returns void
             */
            syncRoles: async (): Promise<void> => {

                const users = await this.client.db.prisma.users.findMany({ include: { permissions: true } });

                if (!users) return this.client.logs.error(`[ACTION]: beta sync failed, no users found in our database!`);

                for (const user of users) {

                    const guild = this.client.guilds.cache.get('871204257649557604');

                    if (!guild) return this.client.logs.error(`[ACTION]: beta sync failed, unable to locate the guild in our cache!`);

                    const gMember = await guild.members.fetch(user.userid as string).catch(() => null);

                    if (!gMember) {
                        this.client.logs.error(`[ACTION]: beta sync failed, skipping beta sync for ${user.username} as they are not in our guild!`);
                        continue;
                    }

                    if (!gMember.roles.cache.has('871275619336474664') && !user.beta) {
                        this.client.logs.error(`[ACTION]: beta sync failed, user: ${user.username} is not a Beta Member, skipping!`);
                        continue;
                    }

                    const update = await this.client.db.prisma.users.update({ where: { userid: user.userid as string }, data: { beta: true } });

                    if (!update) {
                        this.client.logs.error(`[ACTION]: beta sync failed, unable to update beta status for ${user.username}!`);
                        continue;
                    }

                    this.client.logs.ready(`Beta status has been synced for ${user.username}!`);
                }

                return this.client.logs.ready(`Beta status has been synced for all users!`);
            },
            syncPerms: async (): Promise<void> => {

                const users = await this.client.db.prisma.users.findMany({ include: { permissions: true } });

                if (!users) return this.client.logs.error(`[ACTION]: permission sync failed, no users found in our database!`);

                for (const user of users) {

                    const guild = this.client.guilds.cache.get('871204257649557604');

                    if (!guild) return this.client.logs.error(`[ACTION]: permission sync failed, unable to locate the guild in our cache!`);

                    const gMember = await guild.members.fetch(user.userid as string).catch(() => null);

                    if (!gMember) {
                        this.client.logs.error(`[ACTION]: permission sync failed, skipping permission sync for ${user.username} as they are not in our guild!`);
                        continue;
                    }

                    const roles = [
                        '871275330424426546',
                        '871275407134040064',
                        '1138246343412953218',
                        '871275518794801193',
                        '1136100365243260959'
                    ]

                    const hasRole = roles.some(role => gMember.roles.cache.has(role))

                    if (!hasRole) {
                        this.client.logs.error(`[ACTION]: permission sync failed, user: ${user.username} does not have any staff roles, skipping!`);
                        continue;
                    }

                    const perms: string[] = [];

                    if (gMember.roles.cache.has('871275330424426546')) perms.push('OWNER');
                    if (gMember.roles.cache.has('871275407134040064')) perms.push('DEVELOPER');
                    if (gMember.roles.cache.has('1138246343412953218')) perms.push('SUPPORT');
                    if (gMember.roles.cache.has('871275518794801193')) perms.push('ADMIN');
                    if (gMember.roles.cache.has('1136100365243260959')) perms.push('STAFF');

                    const permsToCreate = perms.filter(perm => !user.permissions.find(p => p.name === perm));

                    const update = await this.client.db.modules.perms.user.update({
                        user: user.userid as string,
                        perm: permsToCreate as GatePermissions[]
                    });

                    if (!update.success) {
                        this.client.logs.error(`[ACTION]: permission sync failed, unable to update permissions for ${user.username}!`);
                        this.client.logs.debug(`[ACTION_DEBUG]: ${update.message}`);
                        continue;
                    }

                    this.client.logs.ready(`Permissions have been synced for ${user.username}!`);
                }

                return this.client.logs.ready(`Permissions have been synced for all users!`);
            },
            listOrgs: async (userid: string): Promise<Responses> => {

                const user = await this.prisma.users.findUnique({
                    where: { userid },
                    include: { orgs: true }
                });

                if (!user) return { success: false, message: 'User does not have any orgs' }

                return { success: true, data: user.orgs }
            }
        }
    }
}
