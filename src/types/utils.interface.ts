import type { 
    ApplicationCommand,
    ApplicationCommandData,
    ChatInputApplicationCommandData,
      CommandInteraction,
      CommandInteractionOptionResolver,
      ContextMenuCommandBuilder,
      ContextMenuCommandInteraction,
      GuildMember,
      PermissionResolvable,
    PermissionsString,
    BitFieldResolvable, 
    GatewayIntentsString, 
    Interaction, 
    SlashCommandBuilder 
  } from 'discord.js';
  import type CordXClient from '../client/CordX';
  
  export interface IConfig {
    intents: BitFieldResolvable<GatewayIntentsString, number>;
    restVersion: '10' | '9';
    API: {
      domain: 'https://api.cordx.lol/v3/',
      secret: string
    }
    Cordx: {
      domain: 'https://cordx.lol',
      docs: 'https://help.cordx.lol'
    }
    Discord: {
      mainToken: string,
      devToken: string
    }
    EmbedColors: {
      base: "#2e004d",
      error: "#FF0000",
      success: "#2BBF00",
      warning: "#D4F30E",
    }
  }
  
  export interface IEvent {
    props: IEventBaseProps;
    execute: (...args: unknown[]) => void;
  }
  
  export interface ICommand {
    data: SlashCommandBuilder;
    execute: (client: CordXClient, interaction: Interaction) => void;
    props: ICommandBaseProps;
  }
  
  export interface ICommandBaseProps {
    name: string;
    description: string;
    category: string;
    cooldown: number;
    ownerOnly?: boolean;
    userPermissions: PermissionResolvable[];
    clientPermissions: PermissionResolvable[];
  }
  
  export interface IEventBaseProps {
    name: string;
    once?: boolean;
  }
  
  export interface ISlashCommand {
    props: ISlashCommandProps;
    execute: (client: CordXClient, interaction: Interaction, args: any) => void;
    discord?: {
      ApplicationCommand: ApplicationCommand;
      ApplicationCommandData: ApplicationCommandData;
    }
  }
  
  export interface ISlashCommandProps {
    name: string;
    description: string;
    usage?: string;
    example?: string;
    category: string;
    cooldown: number;
    ownerOnly?: boolean;
    userPermissions: PermissionResolvable[];
    clientPermissions: PermissionResolvable[];
    options?: SlashCommandOptions[];
  }
  
  export interface SlashCommandOptions {
    name: string;
    description: string;
    usage?: string;
    example?: string;
    options?: any[];
    choices?: any[];
    required?: boolean;
    type: number;
  }