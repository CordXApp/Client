import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SubCommandOptions } from "../../../../types/client/utilities";
import { SlashBase } from "../../../../schemas/command.schema";
import type CordX from "../../../cordx";
import moment from "moment";

export default class WhoIs extends SlashBase {
    constructor() {
        super({
            name: 'whois',
            description: 'View information about yourself or another user!',
            category: 'Users',
            cooldown: 5,
            permissions: {
                user: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands'],
                bot: ['SendMessages', 'EmbedLinks', 'UseApplicationCommands']
            },
            options: [{
                name: 'user',
                description: 'The user you want to view information about.',
                type: SubCommandOptions.User,
                required: false
            }]
        })
    }

    public async execute(
        client: CordX,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {

        const user = interaction.options.getMember('user') || interaction.member as any;
        const member = await interaction.guild?.members.fetch(user.id);

        if (!member) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: 'User Not Found',
                    description: 'The user you are trying to view information about could not be found in this guild!',
                    color: client.config.EmbedColors.error
                })
            ]
        })

        if (member.user.bot) return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: `About: ${member.user.tag}`,
                    description: 'Here is some information about the requested application!',
                    color: client.config.EmbedColors.base,
                    thumbnail: member.user.displayAvatarURL(),
                    fields: [{
                        name: 'Created',
                        value: `\`${moment(member.user.createdAt).format('LL')}\``,
                        inline: true
                    }, {
                        name: 'Joined',
                        value: `\`${moment(member.joinedAt).format('LL')}\``,
                        inline: true
                    }, {
                        name: 'Nickname',
                        value: member.nickname || 'No nickname set!',
                        inline: true
                    }, {
                        name: 'Permissions',
                        value: `${member.roles.highest.permissions.toArray().join(', ') || 'No guild permissions'}`,
                        inline: false
                    }]
                })
            ]
        })

        return interaction.reply({
            embeds: [
                new client.EmbedBuilder({
                    title: `About: ${member.user.username}`,
                    description: 'Here is some information about the requested user!',
                    color: client.config.EmbedColors.base,
                    thumbnail: member.user.displayAvatarURL(),
                    fields: [{
                        name: 'Created At',
                        value: `\`${moment(member.user.createdAt).format('LL')}\``,
                        inline: true
                    }, {
                        name: 'Joined Guiled',
                        value: `\`${moment(member.joinedAt).format('LL')}\``,
                        inline: true
                    }, {
                        name: 'Guild Nickname',
                        value: member.nickname || 'No nickname set!',
                        inline: true
                    }, {
                        name: 'Server Roles',
                        value: `${member.roles.cache.filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join(', ')}`,
                        inline: true
                    }, {
                        name: 'Team Roles',
                        value: `${await client.perms.user.acknowledgments(member.user.id)}`,
                        inline: true
                    }, {
                        name: 'Boost Status',
                        value: `${member.premiumSince ? `Boosting since \`${moment(member.premiumSince).format('LL')}\`` : 'Not currently boosting this server :sob:'}`,
                        inline: true
                    }, {
                        name: 'Guild Permissions',
                        value: `${member.roles.highest.permissions.toArray().join(', ') || 'No guild permissions'}`,
                        inline: false
                    }]
                })
            ]
        })
    }
}