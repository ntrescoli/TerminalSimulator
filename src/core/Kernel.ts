import { commandList } from '../commands';
import { CommandContext, ICommand } from '../types/types';
import { Environment } from './Environment';
import { FileSystem } from './FileSystem';
import { UserManager } from './UserManager';
import { PathResolver } from './filesystem/PathResolver';

export class Kernel {
    private startTime: number;
    private commands: Map<string, ICommand> = new Map();
    private fs: FileSystem;
    private env: Environment;
    private userManager: UserManager;
    private history: string[] = [];
    private isReady: boolean = false;

    constructor() {
        this.startTime = Date.now();
        this.env = new Environment();
        this.fs = new FileSystem(this.env);
        this.userManager = new UserManager(this.fs);
        this.loadCommands();
    }

    public async boot() {
        if (this.isReady) return;
        await this.initSystem();
        this.isReady = true;
    }

    private async initSystem() {
        try {
            const response = await fetch('vms/default.json');
            if (!response.ok) throw new Error();
            const config = await response.json();

            this.fs.loadFromJSON(config);
            if (config.users) this.userManager.loadUsers(config.users);
            if (config.groups) this.userManager.loadGroups(config.groups);
            
            if (config.env) {
                this.env.loadFromObject(config.env);
            } else {
                this.env.loadDefaults();
            }
            if (config.history) this.loadHistory(config.history);

        } catch (error) {
            console.warn("Kernel: Error loading config, using defaults.");
            this.env.loadDefaults();
            this.fs.loadDefaults();
            this.userManager.loadDefaults();
        }
    }

    private loadCommands() {
        commandList.forEach(cmd => {
            this.commands.set(cmd.name, cmd);
            if (cmd.alias) {
                cmd.alias.forEach(a => this.commands.set(a, cmd));
            }
        });
    }

    // --- MOTOR DE EJECUCIÓN CENTRALIZADO ---

    public async execute(input: string, skipHistory: boolean = false): Promise<string> {
        const trimmedInput = input.trim();
        if (!trimmedInput) return "";

        if (!skipHistory) {
            this.history.push(trimmedInput);
        }

        // Soporte para Pipes (Ejecución secuencial)
        if (trimmedInput.includes('|')) {
            const commands = trimmedInput.split('|').map(s => s.trim());
            let lastOutput = "";
            for (const cmdText of commands) {
                // Pasamos el output del comando anterior como pipeInput
                lastOutput = await this.processCommandLine(cmdText, lastOutput);
            }
            return lastOutput;
        }

        return await this.processCommandLine(trimmedInput);
    }

    private async processCommandLine(commandLine: string, pipeInput: string = ""): Promise<string> {
        let finalCommandLine = commandLine.trim();
        let targetFile: string | null = null;
        let isAppend = false;

        // 1. Detectar Redirecciones (Priorizamos >> sobre >)
        const appendMatch = finalCommandLine.match(/>>\s*([^\s]+)$/);
        const overwriteMatch = finalCommandLine.match(/>\s*([^\s]+)$/);

        if (appendMatch) {
            isAppend = true;
            targetFile = appendMatch[1];
            finalCommandLine = finalCommandLine.replace(/>>\s*[^\s]+$/, '').trim();
        } else if (overwriteMatch) {
            isAppend = false;
            targetFile = overwriteMatch[1];
            finalCommandLine = finalCommandLine.replace(/>\s*[^\s]+$/, '').trim();
        }

        // 2. Tokenización
        const tokens = this.tokenize(finalCommandLine);
        if (tokens.length === 0) return "";

        const name = tokens[0].toLowerCase();
        const rawTokens = tokens.slice(1);

        const cmd = this.commands.get(name);
        if (!cmd) return `-bash: ${name}: command not found`;

        // 3. Parseo de argumentos y flags
        const { options, args, flagValues } = this.parseArgsAndFlags(rawTokens, cmd.valuedFlags);

        // 4. Creación del contexto
        const context: CommandContext = {
            args,
            options,
            flagValues,
            rawArgs: rawTokens,
            fs: this.fs,
            env: this.env,
            userManager: this.userManager,
            pipeInput,
            kernel: this,
            hasFlag: (f: string) => options.includes(f.startsWith('-') ? f : `-${f}`)
        };

        // 5. Ejecución
        const result = await cmd.execute(context);

        // 6. Manejo de la salida (Redirección o Retorno)
        if (targetFile) {
            const writeResult = this.fs.writeFile(targetFile, result, isAppend);
            if (!writeResult.success) {
                return writeResult.error;
            }
            return "";
        }

        return result;
    }

    // --- UTILIDADES DE PARSEO ---

    private tokenize(input: string): string[] {
        const regex = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
        const parts: string[] = [];
        let match;
        while ((match = regex.exec(input)) !== null) {
            parts.push(match[1] || match[2] || match[3]);
        }
        return parts;
    }

    private parseArgsAndFlags(tokens: string[], valuedFlags: string[] = []) {
        const options: string[] = [];
        const args: string[] = [];
        const flagValues: { [key: string]: string } = {};

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.startsWith('-') && token.length > 1) {
                const isLong = token.startsWith('--');
                const cluster = isLong ? [token.slice(2)] : token.slice(1).split('');

                for (let j = 0; j < cluster.length; j++) {
                    const char = cluster[j];
                    const flagName = isLong ? `--${char}` : `-${char}`;
                    options.push(flagName);

                    if (valuedFlags.includes(char) || valuedFlags.includes(flagName)) {
                        if (!isLong && token.slice(j + 1).length > 0) {
                            flagValues[flagName] = token.slice(j + 1);
                            break;
                        } else if (i + 1 < tokens.length) {
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
    }

    // --- SISTEMA Y AUTOCOMPLETADO ---

    public getPromptText(): string {
        const user = this.env.get('USER') || 'guest';
        const host = this.env.get('HOSTNAME') || 'js-terminal';
        const path = this.fs.getPresentWorkingDirectory();
        return `${user}@${host}:${path}$ `;
    }

    public getCompletions(input: string): string[] {
        const tokens = input.split(/\s+/);
        const lastToken = tokens[tokens.length - 1];

        // Autocompletar comandos
        if (tokens.length === 1 && !input.endsWith(' ')) {
            return Array.from(this.commands.keys())
                .filter(name => name.startsWith(lastToken.toLowerCase()))
                .map(name => name + " ");
        }

        // Autocompletar rutas
        const lastSlashIndex = lastToken.lastIndexOf('/');
        let partialName = lastToken;
        let pathPrefix = "";
        let searchDirNode;

        if (lastSlashIndex !== -1) {
            pathPrefix = lastToken.substring(0, lastSlashIndex + 1);
            partialName = lastToken.substring(lastSlashIndex + 1);
            searchDirNode = PathResolver.resolve(pathPrefix, this.fs.currentDirectory, this.fs.root);
        } else {
            searchDirNode = this.fs.currentDirectory;
        }

        if (!searchDirNode || searchDirNode.type !== 'dir') return [];

        return searchDirNode.children
            .filter(child => child.name.startsWith(partialName))
            .map(child => {
                const suffix = child.type === 'dir' ? '/' : ' ';
                return pathPrefix + child.name + suffix;
            });
    }

    public getHistory(): string[] { return this.history; }
    public loadHistory(historyData: string[]) { this.history = historyData; }

    public getUptime(): number {
        return Date.now() - this.startTime;
    }

    public exportFullSystemState() {
        return {
            env: this.env.getAll(),
            fileSystem: this.fs.serialize(),
            users: this.userManager.getUsers(),
            groups: this.userManager.getGroups(),
            history: this.history
        };
    }
}