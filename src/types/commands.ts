import type {
    ApplicationCommand,
    ApplicationCommandData,
    PermissionResolvable,
    Interaction,
} from "discord.js"
import type CordXClient from "../client/CordX"

export interface ISlashCommand {
    props: ISlashCommandProps
    execute: (client: CordXClient, interaction: Interaction, args: any) => void
    discord?: {
        ApplicationCommand: ApplicationCommand
        ApplicationCommandData: ApplicationCommandData
    }
}

export interface ISlashCommandProps {
    name: string
    description: string
    usage?: string
    example?: string
    category: string
    cooldown: number
    ownerOnly?: boolean
    userPermissions: PermissionResolvable[]
    clientPermissions: PermissionResolvable[]
    options?: SlashCommandOptions[]
}

export interface SlashCommandOptions {
    name: string
    description: string
    usage?: string
    example?: string
    options?: any[]
    choices?: any[]
    required?: boolean
    type: number
}
