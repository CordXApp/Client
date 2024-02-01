import { GuildMember } from "discord.js"
import EventBase from "../../../schemas/Event.schema"
import type CordX from "../../CordX"

export default class GuildMemberAdd extends EventBase {
    constructor() {
        super({ name: "guildMemberAdd" })
    }

    public async execute(client: CordX, member: GuildMember): Promise<any> {
        if (member.guild.id !== "871204257649557604") return

        let m_role: any =
            await member.guild.roles.cache.get("871275762601299988")
        let b_role: any =
            await member.guild.roles.cache.get("871278093199884288")
        let l_chan: any = await member.guild.channels.cache.find(
            (c) => c.id === "871275187377688628",
        )

        let username = member.user.globalName
            ? member.user.globalName
            : member.user.username

        if (!member.user.bot) {
            await member.roles.add(m_role)

            await client.logs.info(
                `[Member Join] ${username} has joined the server and has been given the ${m_role.name} role!`,
            )

            return l_chan.send({
                embeds: [
                    new client.Embeds({
                        title: "Member Joined!",
                        description:
                            "A new user has spawned, can we trust them?",
                        color: client.config.EmbedColors.base,
                        fields: [
                            {
                                name: "User",
                                value: `${username} (${member.user.id})`,
                                inline: true,
                            },
                            {
                                name: "Account Created",
                                value: `${member.user.createdAt.toLocaleString()}`,
                                inline: true,
                            },
                        ],
                    }),
                ],
            })
        } else {
            await member.roles.add(b_role)

            await client.logs.info(
                `[Bot Join] ${username} has joined the server and has been given the ${b_role.name} role!`,
            )

            return l_chan.send({
                embeds: [
                    new client.Embeds({
                        title: "Bot Joined!",
                        description: "A new bot has spawned, can we trust it?",
                        color: client.config.EmbedColors.base,
                        fields: [
                            {
                                name: "Bot",
                                value: `${username} (${member.user.id})`,
                                inline: true,
                            },
                            {
                                name: "Account Created",
                                value: `${member.user.createdAt.toLocaleString()}`,
                                inline: true,
                            },
                        ],
                    }),
                ],
            })
        }
    }
}
