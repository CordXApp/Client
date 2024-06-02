import { GuildMember, TextChannel } from "discord.js"
import EventBase from "../../../schemas/event.schema"
import type CordX from "../../cordx"

export default class GuildMemberUpdate extends EventBase {
    constructor() {
        super({ name: "guildMemberUpdate" })
    }

    public async execute(client: CordX, oldMember: GuildMember, newMember: GuildMember): Promise<any> {

        if (oldMember.guild.id !== "871204257649557604") return;

        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;
        const user = await client.db.user.model.fetch(newMember.user.id);
        const logs = newMember.guild.channels.cache.get("871275187377688628") as TextChannel;

        const betaMember = newMember.guild.roles.cache.find(role => role.name === 'Beta Member', { force: true });

        if (!betaMember) return;
        if (!user.success) return;

        if (newRoles.has(betaMember.id) && !oldRoles.has(betaMember.id)) {
            await client.db.prisma.users.update({
                where: { userid: newMember.user.id },
                data: { beta: true }
            }).then(() => {
                client.logs.info(`[BETA]: ${newMember.user.tag} has been given the Beta role!`);
            }).catch((err: Error) => {
                client.logs.error(`[BETA]: failed to assign beta role to ${newMember.user.tag} - ${err.message}`);
                client.logs.debug(err.stack as string);
            })
        }

        if (oldRoles.has(betaMember.id) && !newRoles.has(betaMember.id)) {
            await client.db.prisma.users.update({
                where: { userid: newMember.user.id },
                data: { beta: false }
            }).then(() => {
                client.logs.info(`[BETA]: ${newMember.user.tag} has lost the Beta role!`);
            }).catch((err: Error) => {
                client.logs.error(`[BETA]: failed to remove beta role from ${newMember.user.tag} - ${err.message}`);
                client.logs.debug(err.stack as string);
            })
        }

        return logs!.send({
            embeds: [{
                title: 'Audit: member updated',
                description: `**${newMember.displayName}** has been updated`,
                fields: [{
                    name: 'Nickname',
                    value: `${oldMember.nickname || "None"} => ${newMember.nickname || "None"}`,
                    inline: false
                }, {
                    name: 'Roles',
                    value: `${oldRoles.map(r => r.name).join(", ")} => ${newRoles.map(r => r.name).join(", ")}`,
                    inline: false
                }, {
                    name: 'Beta Member',
                    value: `${oldRoles.has(betaMember.id) ? "Yes" : "No"} => ${newRoles.has(betaMember.id) ? "Yes" : "No"}`,
                    inline: false
                }]
            }]
        })
    }
}
