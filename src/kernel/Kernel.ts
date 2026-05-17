import { FileSystem } from '../slices/filesystem/application/services/FileSystem';
import { PathResolver } from '../slices/filesystem/application/services/PathResolver';
import { Environment } from '../slices/system/domain/entities/Environment';
import { UserManagerService } from '../slices/usermanager/application/services/UserManagerService';
import { commandList } from './application/commands';
import { CommandContext, ICommand } from './domain/entities/Command';

import { UserManagerRepositoryImpl } from '../slices/usermanager/infrastructure/persistence/UserManagerRepositoryImpl';
import { UserStateSaverImpl } from '../slices/usermanager/infrastructure/persistence/UserStateSaverImpl';
import { FileSystemStateSaverImpl } from '../slices/filesystem/infrastructure/FileSystemStateSaverImpl';
import { EnvironmentStateSaverImpl } from '../slices/system/infrastructure/EnvironmentStateSaverImpl';
import { JsonStorageRepositoryImpl } from './infrastructure/persistence/JsonStorageRepositoryImpl';
import { GroupStateSaverImpl } from '../slices/usermanager/infrastructure/persistence/GroupStateSaverImpl';

export class Kernel {
    private startTime: number;
    private commands: Map<string, ICommand> = new Map();
    private fs: FileSystem;
    private fsStateImpl: FileSystemStateSaverImpl;
    private env: Environment;
    private envStateImpl: EnvironmentStateSaverImpl;
    private userManager: UserManagerService;
    private userStateImpl: UserStateSaverImpl;
    private groupStateImpl: GroupStateSaverImpl;
    private history: string[] = [];
    private jsonStorageImpl: JsonStorageRepositoryImpl;
    private isReady: boolean = false;

    constructor() {
        this.startTime = Date.now();
        this.env = new Environment();
        this.envStateImpl = new EnvironmentStateSaverImpl(this.env);
        this.fs = new FileSystem(this.env);
        this.fsStateImpl = new FileSystemStateSaverImpl(this.fs);
        
        // Inyectamos la infraestructura de Usuarios
        const userRepo = new UserManagerRepositoryImpl(this.fs);
        this.userManager = new UserManagerService(this.fs, userRepo);
        this.userStateImpl = new UserStateSaverImpl(this.userManager);
        this.groupStateImpl = new GroupStateSaverImpl(this.userManager);

        // Registramos los adaptadores de infraestructura que unen los slices al puerto del Kernel
        const stateSavers = [
            this.envStateImpl,
            this.fsStateImpl,
            this.userStateImpl
        ];

        this.jsonStorageImpl = new JsonStorageRepositoryImpl(stateSavers);

        this.loadCommands();
    }

    public async boot() {
        if (this.isReady) return;
        await this.initSystem();
        this.isReady = true;
    }

    private async initSystem() {
        try {
            await this.jsonStorageImpl.loadData();
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

        // 🌟 INTERCEPCIÓN DE ALIAS DE SISTEMA
        // Extraemos temporalmente la primera palabra antes de tokenizar para verificar si es un alias
        const firstSpaceIndex = finalCommandLine.indexOf(' ');
        const potentialAlias = firstSpaceIndex === -1 ? finalCommandLine : finalCommandLine.substring(0, firstSpaceIndex);
        const restOfLine = firstSpaceIndex === -1 ? "" : finalCommandLine.substring(firstSpaceIndex);

        // Si existe un alias registrado en el EnvironmentService, lo expandimos en la línea de comandos
        const expandedCommand = this.env.getAlias(potentialAlias.trim());
        if (expandedCommand) {
            finalCommandLine = `${expandedCommand}${restOfLine}`.trim();
        }

        // 2. Tokenización (Opera de manera normal sobre el comando real o expandido)
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
            hasFlag: (f: string) => options.includes(f.startsWith('-') ? f : `-${f}`),
            rawInput: commandLine
        };

        // 5. Ejecución
        const result = await cmd.execute(context);

        // 6. Manejo de la salida (Redirección o Retorno)
        if (targetFile) {
            const writeResult = this.fs.writeFile(targetFile, result, isAppend);
            if (!writeResult.isSuccess) {
                return writeResult.getError();
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
        const path = PathResolver.getAbsolutePath(this.fs.getCurrentDirectory());
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
            searchDirNode = PathResolver.resolve(pathPrefix, this.fs.getCurrentDirectory(), this.fs.getRoot());
        } else {
            searchDirNode = this.fs.getCurrentDirectory();
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

    public getUptime(): number {
        return Date.now() - this.startTime;
    }

    public exportFullSystemState() {
        return {
            env: this.envStateImpl.getState(),
            fileSystem: this.fsStateImpl.getState(),
            users: this.userStateImpl.getState(),
            groups: this.groupStateImpl.getState(),
            history: this.history
        };
    }
}