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
    private history: string[] = [];

    private isReady: boolean = false;

    constructor() {
        this.env = new Environment();
        this.fs = new FileSystem(this.env);
        this.userManager = new UserManager(this.fs);
        this.loadCommands();
        // NO llamamos a initSystem aquí
    }

    public async boot() {
        if (this.isReady) return;
        await this.initSystem(); // Tu método que hace el fetch
        this.isReady = true;
    }

    /**
     * Lógica de carga: JSON externo vs Configuración por defecto
     */
    private async initSystem() {
        try {
            const response = await fetch('/vms/default.json');
            if (!response.ok) throw new Error();
            const config = await response.json();

            // 1. Cargar Archivos
            this.fs.loadFromJSON(config);

            // 2. Cargar Usuarios
            if (config.users) this.userManager.loadUsers(config.users);

            // 3. CARGAR VARIABLES DE ENTORNO
            if (config.env) {
                this.env.loadFromObject(config.env);
            } else {
                this.env.loadDefaults();
            }

            // 4. Cargar Historial
            if (config.history) this.loadHistory(config.history);

        } catch (error) {
            this.env.loadDefaults();
            this.fs.loadDefaults();
            this.userManager.loadDefaults();
        }
    }

    private loadCommands() {
        commandList.forEach(cmd => {
            this.commands.set(cmd.name, cmd);
            // Soporte para alias si los comandos los tienen
            if (cmd.alias) {
                cmd.alias.forEach(a => this.commands.set(a, cmd));
            }
        });
    }

    // --- MÉTODOS DE EJECUCIÓN (Se mantienen igual) ---

    private parseArgsAndFlags(tokens: string[], valuedFlags: string[] = []) {
        const options: string[] = [];
        const args: string[] = [];
        const flagValues: { [key: string]: string } = {};

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.startsWith('-') && token.length > 1) {
                const cluster = token.startsWith('--') ? [token.slice(2)] : token.slice(1).split('');
                const isLong = token.startsWith('--');

                for (let j = 0; j < cluster.length; j++) {
                    const char = cluster[j];
                    const flagName = isLong ? `--${char}` : `-${char}`;
                    options.push(flagName);

                    if (valuedFlags && valuedFlags.includes(char)) {
                        const remaining = !isLong ? token.slice(j + 2) : "";
                        if (remaining) {
                            flagValues[flagName] = remaining;
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
    };

    async execute(input: string): Promise<string> {
        if (!input.trim()) return "";

        const trimmedInput = input.trim();
        if (!trimmedInput) return "";

        // Guardamos en el historial antes de procesar pipes o redirecciones
        this.history.push(trimmedInput);

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
        const redirectMatch = commandLine.match(/>\s*([^\s]+)$/);
        let targetFile: string | null = null;
        let finalCommandLine = commandLine;

        if (redirectMatch) {
            targetFile = redirectMatch[1];
            finalCommandLine = commandLine.replace(/>\s*[^\s]+$/, '').trim();
        }

        const tokens = this.tokenize(finalCommandLine);
        const name = tokens[0]?.toLowerCase();
        const rawTokens = tokens.slice(1);

        const cmd = this.commands.get(name);
        if (!cmd) return `-bash: ${name}: command not found`;

        const { options, args, flagValues } = this.parseArgsAndFlags(rawTokens, cmd.valuedFlags);

        const result = await cmd.execute({
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
        const user = this.env.get('USER') || 'guest';
        const host = this.env.get('HOSTNAME') || 'js-terminal';
        const path = this.fs.getPresentWorkingDirectory();
        return `${user}@${host}:${path}$ `;
    }

    public getCompletions(input: string): string[] {
        const tokens = input.split(/\s+/);
        const lastToken = tokens[tokens.length - 1];

        // Si solo hay un token y no hay espacios, estamos completando un COMANDO
        if (tokens.length === 1 && !input.endsWith(' ')) {
            const commandNames = Array.from(this.commands.keys());
            return commandNames.filter(name => name.startsWith(lastToken.toLowerCase()));
        }

        // Si hay más de un token o el comando ya tiene espacio, completamos ARCHIVOS
        const currentDir = this.fs.getPresentWorkingDirectory();
        const contents = this.fs.readdir(currentDir); // Usamos el nuevo método

        return contents.filter(name => name.startsWith(lastToken));
    }

    // Método público para que el comando 'history' pueda leer los datos
    public getHistory(): string[] {
        return this.history;
    }

    /**
     * Opcional: Cargar un historial previo desde el JSON inicial
     */
    public loadHistory(historyData: string[]) {
        this.history = historyData;
    }

    public exportFullSystemState() {
        return {
            env: this.env.getAll(),
            fileSystem: this.fs.serialize(),
            users: this.userManager.getUsers(),
            history: this.history // <-- Ahora incluimos el historial
        };
    }

}