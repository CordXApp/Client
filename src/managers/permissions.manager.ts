import type CordX from "../client/cordx"
import Logger from "../utils/logger.util"

export class PermissionsManager {
    public client: CordX
    public logs: Logger = new Logger("PermissionsManager")

    constructor(client: CordX) {
        this.client = client
    }

    public async checkPermissions(
        guildId: string,
        userId: string,
        perms: string[],
    ): Promise<boolean> {
        const guild = await this.client.guilds.fetch(guildId)
        const member = await guild.members.fetch(userId)

        if (!member) return false

        const missingPermissions = member.permissions.missing(perms as any)

        if (missingPermissions.length !== 0) {
            this.logs.info(
                `User ${userId} is missing permissions ${missingPermissions.join(
                    ", ",
                )}`,
            )
            return false
        }

        return true
    }

    public async doesUserHaveRole(
        guildId: string,
        userId: string,
        roleId: string,
    ): Promise<boolean> {
        const guild = await this.client.guilds.fetch(guildId)
        const member = await guild.members.fetch(userId)

        if (!member) return false

        const role = await guild.roles.fetch(roleId)

        if (!role) return false

        if (!member.roles.cache.has(role.id)) return false

        return true
    }
}
