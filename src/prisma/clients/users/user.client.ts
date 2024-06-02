import { UserMethods, Responses } from "../../../types/database/index"
import { User } from "../../../types/database/users";
import type CordX from "../../../client/cordx";
import { Prisma } from "@prisma/client";

export class UserClient {
    private client: CordX;

    constructor(client: CordX) {
        this.client = client;
    }

    public get model(): UserMethods {
        return {
            create: async (data: User): Promise<Responses> => {

                const check = await this.client.db.prisma.users.findUnique({ where: { userid: data.userid as string } });

                if (check) return { success: false, message: 'User already exists in our database.' };

                const user = await this.client.db.prisma.users.create({
                    data: { ...data, permissions: [] as Prisma.permissionsUncheckedCreateNestedManyWithoutUsersInput }
                }).catch((err: Error) => {
                    return { success: false, message: err.message }
                });

                return { success: true, data: user }
            },
            exists: async (id: User['userid']): Promise<Boolean> => {

                const user = await this.client.db.prisma.users.findUnique({ where: { userid: id } });

                if (!user) return false;

                return true;
            },
            fetch: async (id: User['userid']): Promise<Responses> => {

                const user = await this.client.db.prisma.users.findUnique({ where: { userid: id } })

                if (!user) return { success: false, message: 'Unable to locate that user in our database.' };

                return { success: true, message: 'User found', data: user }
            },
            update: async (id: User['userid'], data: User): Promise<Responses> => {

                const check = await this.client.db.prisma.users.findUnique({ where: { userid: id } });

                if (!check) return { success: false, message: 'Unable to locate that user in our database.' };

                const user = await this.client.db.prisma.users.update({ where: { userid: id }, data: { ...data, permissions: [] as Prisma.permissionsUncheckedCreateNestedManyWithoutUsersInput } });

                if (!user) return { success: false, message: 'Unable to locate that user in our database.' };

                return { success: true, data: user }
            },
            delete: async (id: User['userid']): Promise<Responses> => {

                const check = await this.client.db.prisma.users.findUnique({ where: { userid: id } });

                if (!check) return { success: false, message: 'Unable to locate that user in our database.' };

                const user = await this.client.db.prisma.users.delete({ where: { userid: id } });

                return { success: true, data: user }
            },
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
            }
        }
    }
}
