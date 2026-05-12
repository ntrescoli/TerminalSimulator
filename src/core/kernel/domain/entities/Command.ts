import { Environment } from '../../../system/domain/entities/Environment';
import { UserManager } from '../../../usermanager/domain/services/UserManager';

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
