import { FileSystem } from './FileSystem';
import { Environment } from './Environment';

export interface CommandContext {
    args: string[];           // Solo los parámetros (ej: ["home", "docs"])
    options: string[];        // Solo los flags (ej: ["-l", "-a"])
    rawArgs: string[];        // Todo el array original por si acaso
    fs: FileSystem;
    env: Environment;
    // Función de utilidad rápida para el comando
    hasFlag: (flag: string) => boolean;
    pipeInput?: string; // <--- El contenido que viene del comando anterior
}

export interface ICommand {
    name: string;
    alias?: string[];
    execute(context: CommandContext): string | Promise<string>;
}
