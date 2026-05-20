import type { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import type { Environment } from '../../../slices/system/domain/entities/Environment';
import type { UserManagerService } from '../../../slices/usermanager/application/services/UserManagerService';

export interface CommandContext {
    args: string[];           // Solo los parámetros (ej: ["home", "docs"])
    options: string[];        // Solo los flags (ej: ["-l", "-a"])
    rawArgs: string[];        // Todo el array original por si acaso
    flagValues: { [key: string]: string };
    fs: FileSystem;
    env: Environment;
    userManager: UserManagerService;
    // Función de utilidad rápida para el comando
    hasFlag: (flag: string) => boolean;
    pipeInput?: string; // <--- El contenido que viene del comando anterior
    signal?: AbortSignal;
    kernel: any; // o el tipo Kernel
    rawInput?: string;
}

export interface ICommand {
    name: string;
    alias?: string[];
    valuedFlags?: string[]; // Define qué flags esperan un valor (ej: ['u', 'o'])
    execute: (context: CommandContext) => Promise<string> | string;
}
