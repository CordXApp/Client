import { Guild } from "discord.js"
import EventBase from "../../../schemas/event.schema"
import type CordX from "../../cordx"

export default class GuildCreate extends EventBase {
    constructor() {
        super({ name: "guildCreate" })
    }

    public async execute(client: CordX, guild: Guild): Promise<any> {

        const user = await guild.fetchOwner();
        const owner = await client.db.user.model.fetch(user.id);

        if (!owner.success) return;

        if (!owner.data.beta) {

            user.createDM(true).then(dm => {
                dm.send({
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Unauthorized Guild',
                            color: client.config.EmbedColors.error,
                            description: `Hey there, someone recently tried to add me to your server ${guild.name} but I'm currently limited to beta members only so i have left. :victory_hand:`,
                            fields: [{
                                name: 'Want to become a beta member?',
                                value: 'You can join the Beta Program by joining the [CordX Discord Server](https://cordximg.host/discord).',
                                inline: false
                            }]
                        })
                    ]
                })
            })

            return guild.leave()
        }
    }
}
