import type { Message } from "discord.js"
import EventBase from "../../../schemas/event.schema"
import type CordX from "../../cordx"

export default class MessageCreate extends EventBase {
    constructor() {
        super({ name: "messageCreate" })
    }

    public async execute(
        client: CordX,
        message: Message,
    ): Promise<Message | void> {

        if (message.author.bot) return;
        if (!message.guild) return;
        if (message.guild.id !== '871204257649557604') return;

        await client.modules.info.reactions.correction(message);

        const mention = new RegExp(`^<@!?${client.user!.id}> ?`);
        const args = message.content.split(' ');
        const req = args[1]?.trim();
        const bot = args[0];

        if (mention.test(message.content.trim())) return client.modules.info.send.help(message);
        if (mention.test(bot as string) && req === 'help' || req === 'h') return client.modules.info.send.help(message);
        if (mention.test(bot as string) && req === 'support' || req === 'sp') return client.modules.info.send.support(message);
        if (mention.test(bot as string) && req === 'documentation' || req === 'docs') return client.modules.info.send.docs(message);
        if (mention.test(bot as string) && req === 'explain' || req === 'exp') return client.modules.info.send.explain(message);
        if (mention.test(bot as string) && req === 'legal' || req === 'leg') return client.modules.info.send.legal(message);
    }
}
