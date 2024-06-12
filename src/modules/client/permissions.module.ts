import type CordX from "../../client/cordx"
import { Params, Response, PermsClient } from "../../types/modules/perms";
import { GatePermissions } from "../../types/database/users";

export class Permissions implements PermsClient {
    private client: CordX
    private acks: string[]
    private list: any;

    constructor(client: CordX) {
        this.client = client
        this.acks = [];
        this.list = {
            OWNER: [],
            ADMIN: [],
            DEVELOPER: [],
            SUPPORT: [],
            STAFF: []
        }
    }

    public get user() {
        return {
            has: async (opts: Params): Promise<boolean> => {

                const { user, perm } = opts;

                const data = await this.client.db.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                });

                if (!data) return false;

                const perms = Array.isArray(perm) ? perm : [perm];

                return perms.some(perm => data.permissions.some(p => p.name === perm));
            },
            acknowledgments: async (user: string) => {
                const permissions = ['OWNER', 'ADMIN', 'DEVELOPER', 'SUPPORT', 'STAFF'];

                for (const perm of permissions) {
                    this.list[perm] = this.list[perm].filter((u: any) => u !== user);
                }
                this.acks = [];

                for (const perm of permissions) {
                    const hasPerm = await this.client.db.modules.perms.user.has({ user: user, perm: perm as GatePermissions });

                    if (hasPerm) {
                        this.list[perm].push(user);
                        this.acks.push(perm);
                    }
                }

                return this.acks.length > 0 ? this.acks.join(', ') : 'None';
            },
            list: async (user: string): Promise<Response> => {

                const data = await this.client.db.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                })

                if (!data) return { success: false, message: `Unable to locate that user in our database` };

                const { permissions } = data;

                if (permissions.length === 0) return { success: false, message: 'The provided user has no permissions to list' };

                const list = permissions?.map((perm) => `- ${perm.name}`).join('\n');

                return {
                    success: true,
                    message: `Here are the permissions for <@!${user}>`,
                    data: list
                }
            },
            missing: async (opts: Params): Promise<string[]> => {
                const { user, perm } = opts;

                const data = await this.client.db.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                });

                if (!data) return [];

                const perms = Array.isArray(perm) ? perm : [perm];

                return perms.filter(perm => !data.permissions.some(p => p.name === perm));

            },
            update: async (opts: Params): Promise<Response> => {
                const { user, perm } = opts;

                const data = await this.client.db.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                });

                if (!data) return {
                    success: false,
                    message: `Unable to locate that user in our database`,
                };

                const perms = Array.isArray(perm) ? perm : [perm];
                const toAdd = perms.filter(p => !data.permissions.some(dp => dp.name === p));
                const toRemove = perms.filter(p => data.permissions.some(dp => dp.name === p));

                if (toAdd.length === 0 && toRemove.length === 0) return { success: false, message: 'No permission changes detected!' };

                if (toRemove.length > 0) {
                    const remove = await this.user.remove({ user, perm: toRemove });

                    if (!remove) return { success: false, message: `Failed to remove perms: ${toRemove}` };
                }

                const updatedPermissions: any = [...data.permissions, ...toAdd.map(name => ({ name }))].filter(p => !toRemove.includes(p.name));

                for (const perm of updatedPermissions) {
                    let permission = await this.client.db.prisma.permissions.findFirst({
                        where: { name: perm.name },
                    });

                    if (!permission) {
                        permission = await this.client.db.prisma.permissions.create({
                            data: { name: perm.name },
                        });
                    }

                    await this.client.db.prisma.users.update({
                        where: { userid: user },
                        data: {
                            permissions: {
                                connect: {
                                    id: permission.id,
                                },
                            },
                        },
                    }).catch((err: Error) => {
                        this.client.logs.error('Update failed: ' + err.message);
                        this.client.logs.debug('Stack trace: ' + err.stack);

                        return {
                            success: false,
                            message: `Failed to update permissions: ${err.message}`,
                        };
                    });
                }

                this.client.logs.info(`Added: ${toAdd} | Removed: ${toRemove}`)

                return {
                    success: true,
                    message: `updated permissions for: <@!${user}>`,
                    data: {
                        added: toAdd.join(', '),
                        removed: toRemove.join(', ')
                    }
                }
            },
            remove: async (opts: Params): Promise<boolean> => {
                const { user, perm } = opts;

                const data = await this.client.db.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                });

                if (!data) return false;

                const perms = Array.isArray(perm) ? perm : [perm];

                const toRemove = perms.filter(perm => data.permissions.some(p => p.name === perm));

                if (toRemove.length === 0) return false;

                await this.client.db.prisma.users.update({
                    where: { userid: user },
                    data: {
                        permissions: {
                            disconnect: toRemove.map(permissionName => {
                                const permission = data.permissions.find(p => p.name === permissionName);
                                return {
                                    id: permission?.id,
                                    name: permission?.name,
                                };
                            }),
                        }
                    }
                }).catch((err: Error) => {

                    this.client.logs.error('Update failed: ' + err.message);
                    this.client.logs.debug('Stack trace: ' + err.stack);

                    return false;
                });

                const recheck = await this.client.db.prisma.users.findUnique({
                    where: { userid: user },
                    include: { permissions: true }
                })

                const permissionsRemoved = toRemove.every(permissionName => {
                    return !recheck?.permissions.some(p => p.name === permissionName);
                });

                this.client.logs.info(permissionsRemoved ? 'Permissions were removed' : 'Permissions still exist');

                return true;
            }
        }
    }
}
