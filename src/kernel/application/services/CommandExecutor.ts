import type { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import type { Environment } from '../../../slices/system/domain/entities/Environment';
import type { UserManagerService } from '../../../slices/usermanager/application/services/UserManagerService';
import type { CommandContext, ICommand } from '../../domain/entities/Command';

export class CommandExecutor {
    constructor(private readonly env: Environment) {}

    public async execute(
        input: string,
        commands: Map<string, ICommand>,
        fs: FileSystem,
        userManager: UserManagerService,
        kernel: any = null,
        signal?: AbortSignal,
    ): Promise<string> {
        const trimmedInput = input.trim();
        if (!trimmedInput) return '';

        if (signal?.aborted) {
            return 'COMMAND_ABORTED';
        }

        if (trimmedInput.includes('|')) {
            const commandLines = trimmedInput.split('|').map(s => s.trim());
            let lastOutput = '';
            for (const cmdText of commandLines) {
                if (signal?.aborted) {
                    return 'COMMAND_ABORTED';
                }
                lastOutput = await this.processCommandLine(cmdText, commands, fs, userManager, lastOutput, kernel, signal);
            }
            return lastOutput;
        }

        return await this.processCommandLine(trimmedInput, commands, fs, userManager, '', kernel, signal);
    }

    private async processCommandLine(
        commandLine: string,
        commands: Map<string, ICommand>,
        fs: FileSystem,
        userManager: UserManagerService,
        pipeInput = '',
        kernel: any = null,
        signal?: AbortSignal,
    ): Promise<string> {
        let finalCommandLine = commandLine.trim();
        let targetFile: string | null = null;
        let isAppend = false;

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

        const firstSpaceIndex = finalCommandLine.indexOf(' ');
        const potentialAlias = firstSpaceIndex === -1 ? finalCommandLine : finalCommandLine.substring(0, firstSpaceIndex);
        const restOfLine = firstSpaceIndex === -1 ? '' : finalCommandLine.substring(firstSpaceIndex);

        const expandedCommand = this.env.getAlias(potentialAlias.trim());
        if (expandedCommand) {
            finalCommandLine = `${expandedCommand}${restOfLine}`.trim();
        }

        const tokens = this.tokenize(finalCommandLine);
        if (tokens.length === 0) return '';

        const name = tokens[0].toLowerCase();
        const rawTokens = tokens.slice(1);

        const cmd = commands.get(name);
        if (!cmd) return `-bash: ${name}: command not found`;

        const baseValuedFlags = cmd.valuedFlags || [];
        const finalValuedFlags = name === 'sudo'
            ? [...baseValuedFlags, 'sudo-pass', '--sudo-pass']
            : baseValuedFlags;

        const allowedFlags = this.extractAllowedFlagsFromCommand(cmd, finalValuedFlags);
        if (signal?.aborted) {
            return 'COMMAND_ABORTED';
        }

        const { options, args, flagValues } = this.parseArgsAndFlags(rawTokens, finalValuedFlags, allowedFlags);
        const expandedArgs = this.expandGlobPatterns(args, fs);

        const context: CommandContext = {
            args: expandedArgs,
            options,
            flagValues,
            rawArgs: rawTokens,
            fs,
            env: this.env,
            userManager,
            pipeInput,
            signal,
            kernel,
            hasFlag: (f: string) => options.includes(f.startsWith('-') ? f : `-${f}`),
            rawInput: commandLine,
        };

        const result = await cmd.execute(context);

        if (signal?.aborted) {
            return 'COMMAND_ABORTED';
        }

        if (targetFile) {
            const writeResult = fs.writeFile(targetFile, result, isAppend);
            if (!writeResult.isSuccess) {
                return writeResult.getError();
            }
            return '';
        }

        return result;
    }

    public tokenize(input: string): string[] {
        const regex = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
        const parts: string[] = [];
        let match;
        while ((match = regex.exec(input)) !== null) {
            parts.push(match[1] || match[2] || match[3]);
        }
        return parts;
    }

    public parseArgsAndFlags(tokens: string[], valuedFlags: string[] = [], allowedFlags?: Set<string>) {
        const options: string[] = [];
        const args: string[] = [];
        const flagValues: { [key: string]: string } = {};

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.startsWith('-') && token.length > 1) {
                const isLong = token.startsWith('--');
                const cluster = isLong ? [token.slice(2)] : token.slice(1).split('');
                let valueCaptured = false;

                for (let j = 0; j < cluster.length; j++) {
                    const char = cluster[j];
                    const flagName = isLong ? `--${char}` : `-${char}`;
                    // If allowedFlags was provided, only accept this flag if present in allowedFlags
                    if (allowedFlags && !allowedFlags.has(flagName)) {
                        // If it's a long flag and not allowed, stop parsing this token as flags
                        if (isLong) {
                            // treat whole token as arg
                            args.push(token);
                            valueCaptured = true; // to skip outer push
                            break;
                        } else {
                            // for short clusters, when encountering an unknown flag, treat the remainder as a single arg (including the leading '-')
                            const remainder = '-' + cluster.slice(j).join('');
                            args.push(remainder);
                            valueCaptured = true;
                            break;
                        }
                    }

                    options.push(flagName);

                    if (valuedFlags.includes(char) || valuedFlags.includes(flagName)) {
                        if (!isLong && token.slice(j + 2).length > 0) {
                            flagValues[flagName] = token.slice(j + 2);
                            valueCaptured = true;
                            break;
                        } else if (i + 1 < tokens.length) {
                            flagValues[flagName] = tokens[i + 1];
                            i++;
                            valueCaptured = true;
                            break;
                        }
                    }
                }

                if (valueCaptured) continue;
            } else {
                args.push(token);
            }
        }

        return { options, args, flagValues };
    }

    private expandGlobPatterns(args: string[], fs: FileSystem): string[] {
        const expanded: string[] = [];

        for (const arg of args) {
            if (!arg.includes('*') && !arg.includes('?')) {
                expanded.push(arg);
                continue;
            }

            const lastSlashIndex = arg.lastIndexOf('/');
            const prefix = lastSlashIndex === -1 ? '' : arg.substring(0, lastSlashIndex + 1);
            const dirPath = lastSlashIndex === -1 ? '.' : arg.substring(0, lastSlashIndex) || '/';
            const pattern = lastSlashIndex === -1 ? arg : arg.substring(lastSlashIndex + 1);

            const dirNode = fs.resolvePath(dirPath);
            if (!dirNode || dirNode.type !== 'dir') {
                expanded.push(arg);
                continue;
            }

            const regex = this.globToRegExp(pattern);
            const matches = dirNode.children
                .filter(child => {
                    if (child.name.startsWith('.') && !pattern.startsWith('.')) {
                        return false;
                    }
                    return regex.test(child.name);
                })
                .map(child => `${prefix}${child.name}`);

            if (matches.length > 0) {
                expanded.push(...matches);
            } else {
                expanded.push(arg);
            }
        }

        return expanded;
    }

    private globToRegExp(pattern: string): RegExp {
        const escaped = pattern.replace(/([.+^${}()|[\]\\])/g, '\\$1');
        // '*' -> match any sequence, '?' -> match exactly one char
        const regexString = `^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`;
        return new RegExp(regexString);
    }

    private extractAllowedFlagsFromCommand(cmd: ICommand, finalValuedFlags: string[]): Set<string> | undefined {
        try {
            const text = (cmd.execute && cmd.execute.toString && cmd.execute.toString()) || '';
            const flagRegex = /hasFlag\(\s*['"`](-{1,2}[A-Za-z0-9-]+)['"`]\s*\)/g;
            const allowed = new Set<string>();
            let m: RegExpExecArray | null;
            while ((m = flagRegex.exec(text)) !== null) {
                allowed.add(m[1]);
            }

            // include valued flags as single-letter or long forms
            for (const vf of finalValuedFlags) {
                if (vf.startsWith('-')) allowed.add(vf);
                else if (vf.startsWith('--')) allowed.add(vf);
                else if (vf.length === 1) allowed.add(`-${vf}`);
                else allowed.add(`--${vf}`);
            }

            return allowed.size > 0 ? allowed : undefined;
        } catch {
            return undefined;
        }
    }
}
