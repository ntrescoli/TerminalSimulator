import { commandList } from '../commands';
import { ICommand } from '../types/types';
import { Environment } from './Environment';
import { FileSystem } from './FileSystem';
import { UserManager } from './UserManager';

export class Kernel {
    private commands: Map<string, ICommand> = new Map();
    private fs: FileSystem;
    private env: Environment;
    private userManager: UserManager;

    constructor() {
        this.env = new Environment();
        this.fs = new FileSystem(this.env);
        this.userManager = new UserManager(this.fs);
        this.loadCommands();
    }
    
    private loadCommands() {
        commandList.forEach(cmd => {
            this.commands.set(cmd.name, cmd);
        });
    }

    private parseArgsAndFlags(tokens: string[], valuedFlags: string[] = []) {
        const options: string[] = [];
        const args: string[] = [];
        const flagValues: { [key: string]: string } = {};

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.startsWith('-') && token.length > 1) {
                // Eliminar el guion para analizar las letras
                const cluster = token.startsWith('--') ? [token.slice(2)] : token.slice(1).split('');
                const isLong = token.startsWith('--');

                for (let j = 0; j < cluster.length; j++) {
                    const char = cluster[j];
                    const flagName = isLong ? `--${char}` : `-${char}`;
                    options.push(flagName);

                    // ¿Es una flag que espera un valor?
                    if (valuedFlags.includes(isLong ? char : char)) {
                        // 1. Si es flag corta y tiene el valor pegado (ej: -uroot)
                        const remaining = !isLong ? token.slice(j + 2) : "";
                        if (remaining) {
                            flagValues[flagName] = remaining;
                            break; // Salimos del cluster
                        }
                        // 2. Si el valor es el siguiente token (ej: -u root)
                        else if (i + 1 < tokens.length) {
                            flagValues[flagName] = tokens[++i];
                            break;
                        }
                    }
                }
            } else {
                args.push(token);
            }
        }
        return { options, args, flagValues };
    };

    async execute(input: string): Promise<string> {
        if (!input.trim()) return "";

        if (input.includes('|')) {
            const commands = input.split('|').map(s => s.trim());
            let lastOutput = "";

            for (const cmdText of commands) {
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
        const rawTokens = tokens.slice(1);

        const cmd = this.commands.get(name);
        if (!cmd) return `-bash: ${name}: command not found`;

        // 3. SEPARACIÓN DE FLAGS Y PARÁMETROS
        const { options, args, flagValues } = this.parseArgsAndFlags(rawTokens, cmd.valuedFlags);

        // Ejecución
        const result = await cmd.execute({
            args,           // Archivos/Rutas
            options,        // ['-l', '-a', '-h']
            flagValues,     // { '-u': 'root' }
            rawArgs: rawTokens,
            fs: this.fs,
            env: this.env,
            userManager: this.userManager,
            pipeInput,
            kernel: this,
            hasFlag: (f: string) => options.includes(f.startsWith('-') ? f : `-${f}`)
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

    getPromptText(): string {
        const user = this.env.get('USER');
        const host = this.env.get('HOSTNAME');
        const path = this.fs.getPresentWorkingDirectory();
        return `${user}@${host}:${path}$ `;
    }
}