import { Environment } from '../core/Environment';
import { FileSystem } from '../core/FileSystem';
import { UserManager } from '../core/UserManager';

export interface CommandContext {
    args: string[];           // Solo los parámetros (ej: ["home", "docs"])
    options: string[];        // Solo los flags (ej: ["-l", "-a"])
    rawArgs: string[];        // Todo el array original por si acaso
    flagValues: { [key: string]: string };
    fs: FileSystem;
    env: Environment;
    userManager: UserManager;
    // Función de utilidad rápida para el comando
    hasFlag: (flag: string) => boolean;
    pipeInput?: string; // <--- El contenido que viene del comando anterior
    kernel: any; // o el tipo Kernel
}

export interface ICommand {
    name: string;
    alias?: string[];
    valuedFlags?: string[]; // Define qué flags esperan un valor (ej: ['u', 'o'])
    execute: (context: CommandContext) => Promise<string> | string;
}

// directorios y archivos
export type NodeType = 'file' | 'dir';

export interface IPermissions {
    read: boolean;
    write: boolean;
    execute: boolean;
}

export interface INode {
    name: string;
    type: 'file' | 'dir';
    children: INode[];
    parent: INode | null;
    content?: string;
    createdAt: number;
    owner: string;
    group: string;
    // permissions: {
    //     read: boolean;
    //     write: boolean;
    //     execute: boolean;
    // };
    permissions: {
        user: IPermissions;
        group: IPermissions;
        others: IPermissions;
    };
}

export interface User {
    username: string;
    uid: number;
    gid: number;
    home: string;
    shell: string;
    fullName?: string;
}

export interface Group {
    groupName: string;
    gid: number;
    members: string[];
}