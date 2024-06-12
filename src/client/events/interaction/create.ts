import Discord, { Collection, ApplicationCommandOptionType, Permissions, PermissionResolvable } from "discord.js"
import type { CacheType, Interaction, BaseInteraction } from "discord.js"
import EventBase from "../../../schemas/event.schema"
import type CordX from "../../cordx"

export default class InteractionCreate extends EventBase {
    constructor() {
        super({ name: "interactionCreate" })
    }

    public async execute(
        client: CordX,
        interaction: Interaction<CacheType>,
        int: BaseInteraction,
    ): Promise<any> {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName)
            const priv = client.private.get(interaction.commandName)
            const user = await client.db.entity.fetch({
                userid: interaction.user.id,
                entity: 'User'
            })

            if (!user.success) return;

            if (!user.data.beta) return interaction.reply({
                embeds: [
                    new client.EmbedBuilder({
                        title: 'Unauthorized: beta feature',
                        description: 'Hey there, my features are currently limited to beta members only. If you would like to join the beta program, you can do so by joining the [CordX Discord Server](https://cordximg.host/discord).',
                        color: client.config.EmbedColors.error
                    })
                ]
            });

            if (user.data.banned) return interaction.reply({
                embeds: [
                    new client.EmbedBuilder({
                        title: 'Unauthorized: you\'ve been beaned!',
                        description: 'Hold up chief, you got the ban hammer. My services will be unavailable until this is resolved!',
                        color: client.config.EmbedColors.error
                    })
                ]
            });

            const cmd = command || priv

            if (!cmd) return

            const { permissions } = cmd.props;

            if (permissions.gate && permissions.gate.length > 0) {

                const check = await client.db.modules.perms.user.has({
                    user: interaction.user.id,
                    perm: permissions.gate
                })

                const missing = await client.db.modules.perms.user.missing({
                    user: interaction.user.id,
                    perm: permissions.gate
                });

                if (!check && missing && missing.length > 0) return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new client.EmbedBuilder({
                            title: 'Error: missing permissions',
                            description: 'Whoops, looks like you are missing one or more of our necessary team permissions required to execute this command!',
                            color: client.config.EmbedColors.error,
                            fields: [{
                                name: 'Required',
                                value: permissions.gate.join(', '),
                                inline: false
                            }, {
                                name: 'Missing',
                                value: missing.join(', '),
                                inline: false
                            }]
                        })
                    ]
                })
            }

            if (permissions.user && !interaction.memberPermissions?.has(permissions.user)) {

                const required = new Set(permissions.user);
                const available = new Set(interaction.memberPermissions?.toArray());
                const missing = [...required].filter((perm: any) => !available.has(perm))

                if (missing.length > 0) {
                    return interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: missing permissions',
                                description: 'Whoops, looks like you are missing one or more of the necessary permissions required to execute this command',
                                color: client.config.EmbedColors.error,
                                fields: [{
                                    name: 'Required',
                                    value: permissions.user.join(', '),
                                    inline: true
                                }, {
                                    name: 'Available',
                                    value: interaction.memberPermissions?.toArray().join(', '),
                                    inline: true
                                }, {
                                    name: 'Missing',
                                    value: missing.join(', '),
                                    inline: true
                                }]
                            })
                        ]
                    })
                }
            }

            if (permissions.bot) {
                const required = new Set(permissions.bot);
                const available = new Set(interaction.guild?.members.me?.permissions.toArray());
                const missing = [...required].filter((perm: any) => !available.has(perm))

                if (missing.length > 0) {
                    return interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new client.EmbedBuilder({
                                title: 'Error: missing permissions',
                                description: 'Whoops, looks like I am missing one or more of the necessary permissions required to execute this command',
                                color: client.config.EmbedColors.error,
                                fields: [{
                                    name: 'Required',
                                    value: permissions.bot.join(', '),
                                    inline: true
                                }, {
                                    name: 'Missing',
                                    value: missing.join(', '),
                                    inline: true
                                }]
                            })
                        ]
                    })
                }
            }

            if (cmd.props.cooldown > 0) {
                if (!client.cooldown.has(cmd.props.name)) {
                    client.cooldown.set(cmd.props.name, new Collection());
                }

                const now = Date.now();

                const timestamp = client.cooldown.get(cmd.props.name);
                const timeout = cmd.props.cooldown * 1000;

                if (timestamp?.has(interaction.user.id)) {

                    const cooldown = timestamp.get(interaction.user.id);

                    if (cooldown) {
                        const expires = cooldown + timeout;

                        if (now < expires) {
                            const remaining = (expires - now) / 1000;

                            return interaction.reply({
                                ephemeral: true,
                                embeds: [
                                    new client.EmbedBuilder({
                                        title: 'Error: chill pill activated',
                                        description: 'Woah man, i think you need to take a breather. You are doing stuff way to fast!',
                                        color: client.config.EmbedColors.error,
                                        fields: [{
                                            name: 'Cooldown',
                                            value: `\`${timeout}\` seconds`,
                                            inline: false
                                        }, {
                                            name: 'Remaining',
                                            value: `\`${remaining}\` seconds`,
                                            inline: false
                                        }]
                                    })
                                ]
                            })
                        }
                    }
                }

                timestamp?.set(interaction.user.id, now);

                setTimeout(() => timestamp?.delete(interaction.user.id), timeout);
            }

            const args: any = []

            for (let option of interaction.options.data) {
                if (option.type === ApplicationCommandOptionType.Subcommand) {
                    if (option.name) args.push(option.name)
                    option.options?.forEach((x: any) => {
                        if (x.value) args.push(x.value)
                    })
                } else if (option.value) args.push(option.value)
            }

            try {
                cmd.execute(client, interaction, args)
            } catch (err: any) {
                client.logs.error(
                    `Error while executing command ${cmd.props.name}: ${err.stack}`,
                )
                return interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                })
            }
        }
    }
}
