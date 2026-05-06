import { FileSystem } from './FileSystem';
import { Environment } from './Environment';
import { ICommand } from './types';
import * as FSCmds from '../commands/filesystem';
import * as BasicCmds from '../commands/basic'; // Asegúrate de importar BasicCmds

export class Kernel {
    private commands: Map<string, ICommand> = new Map();
    private fs: FileSystem;
    private env: Environment;

    constructor() {
        this.fs = new FileSystem();
        this.env = new Environment();
        this.loadCommands();
    }

    private loadCommands() {
        // Unimos todos los módulos de comandos
        const allCmds = [
            ...Object.values(BasicCmds), 
            ...Object.values(FSCmds)
        ];
        
        allCmds.forEach(cmd => {
            this.commands.set(cmd.name, cmd);
            // Si el comando tiene alias, también los registramos
            if (cmd.alias) {
                cmd.alias.forEach(a => this.commands.set(a, cmd));
            }
        });
    }

async execute(input: string): Promise<string> {
    if (!input.trim()) return "";

    if (input.includes('|')) {
        const commands = input.split('|').map(s => s.trim());
        let lastOutput = "";

        for (const cmdText of commands) {
            // 2. Añadimos el await aquí
            lastOutput = await this.executeCommandChain(cmdText, lastOutput);
        }
        return lastOutput;
    }

    return await this.executeCommandChain(input);
}

private async executeCommandChain(commandLine: string, pipeInput?: string): Promise<string> {
    // 1. Redirección
    const redirectMatch = commandLine.match(/>\s*([^\s]+)$/);
    let targetFile: string | null = null;
    let finalCommandLine = commandLine;

    if (redirectMatch) {
        targetFile = redirectMatch[1];
        finalCommandLine = commandLine.replace(/>\s*[^\s]+$/, '').trim();
    }

    // 2. Tokenización
    const tokens = this.tokenize(finalCommandLine);
    const name = tokens[0]?.toLowerCase();
    const rawArgs = tokens.slice(1);

    const cmd = this.commands.get(name);
    if (!cmd) return `-bash: ${name}: command not found`;

    // 3. SEPARACIÓN DE FLAGS Y PARÁMETROS
    const options = rawArgs.filter(arg => arg.startsWith('-'));
    const args = rawArgs.filter(arg => !arg.startsWith('-'));

    // Ejecución
    const result = await cmd.execute({
        args,
        options,
        rawArgs,
        fs: this.fs,
        env: this.env,
        pipeInput, // <--- Aquí pasamos el regalo del comando anterior
        hasFlag: (f: string) => options.some(opt => opt === f || (opt.startsWith('-') && opt.includes(f.replace('-', ''))))
    });

    if (targetFile) {
        this.fs.writeFile(targetFile, result);
        return "";
    }

    return result;
}

    private tokenize(input: string): string[] {
        const regex = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
        const parts: string[] = [];
        let match;
        while ((match = regex.exec(input)) !== null) {
            parts.push(match[1] || match[2] || match[3]);
        }
        return parts;
    }

    // Necesario para que main.ts siga funcionando
    getPromptText(): string {
        const user = this.env.get('USER');
        const host = this.env.get('HOSTNAME');
        const path = this.fs.getPresentWorkingDirectory();
        return `${user}@${host}:${path}$ `;
    }
}