"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutor = void 0;
class CommandExecutor {
    constructor(env) {
        this.env = env;
    }
    async execute(input, commands, fs, userManager, kernel = null) {
        const trimmedInput = input.trim();
        if (!trimmedInput)
            return "";
        if (trimmedInput.includes('|')) {
            const commandLines = trimmedInput.split('|').map(s => s.trim());
            let lastOutput = "";
            for (const cmdText of commandLines) {
                lastOutput = await this.processCommandLine(cmdText, commands, fs, userManager, lastOutput, kernel);
            }
            return lastOutput;
        }
        return await this.processCommandLine(trimmedInput, commands, fs, userManager, "", kernel);
    }
    async processCommandLine(commandLine, commands, fs, userManager, pipeInput = "", kernel = null) {
        let finalCommandLine = commandLine.trim();
        let targetFile = null;
        let isAppend = false;
        const appendMatch = finalCommandLine.match(/>>\s*([^\s]+)$/);
        const overwriteMatch = finalCommandLine.match(/>\s*([^\s]+)$/);
        if (appendMatch) {
            isAppend = true;
            targetFile = appendMatch[1];
            finalCommandLine = finalCommandLine.replace(/>>\s*[^\s]+$/, '').trim();
        }
        else if (overwriteMatch) {
            isAppend = false;
            targetFile = overwriteMatch[1];
            finalCommandLine = finalCommandLine.replace(/>\s*[^\s]+$/, '').trim();
        }
        const firstSpaceIndex = finalCommandLine.indexOf(' ');
        const potentialAlias = firstSpaceIndex === -1 ? finalCommandLine : finalCommandLine.substring(0, firstSpaceIndex);
        const restOfLine = firstSpaceIndex === -1 ? "" : finalCommandLine.substring(firstSpaceIndex);
        const expandedCommand = this.env.getAlias(potentialAlias.trim());
        if (expandedCommand) {
            finalCommandLine = `${expandedCommand}${restOfLine}`.trim();
        }
        const tokens = this.tokenize(finalCommandLine);
        if (tokens.length === 0)
            return "";
        const name = tokens[0].toLowerCase();
        const rawTokens = tokens.slice(1);
        const cmd = commands.get(name);
        if (!cmd)
            return `-bash: ${name}: command not found`;
        const baseValuedFlags = cmd.valuedFlags || [];
        const finalValuedFlags = name === 'sudo'
            ? [...baseValuedFlags, 'sudo-pass', '--sudo-pass']
            : baseValuedFlags;
        const { options, args, flagValues } = this.parseArgsAndFlags(rawTokens, finalValuedFlags);
        const expandedArgs = this.expandGlobPatterns(args, fs);
        const context = {
            args: expandedArgs,
            options,
            flagValues,
            rawArgs: rawTokens,
            fs,
            env: this.env,
            userManager,
            pipeInput,
            kernel,
            hasFlag: (f) => options.includes(f.startsWith('-') ? f : `-${f}`),
            rawInput: commandLine
        };
        const result = await cmd.execute(context);
        if (targetFile) {
            const writeResult = fs.writeFile(targetFile, result, isAppend);
            if (!writeResult.isSuccess) {
                return writeResult.getError();
            }
            return "";
        }
        return result;
    }
    tokenize(input) {
        const regex = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
        const parts = [];
        let match;
        while ((match = regex.exec(input)) !== null) {
            parts.push(match[1] || match[2] || match[3]);
        }
        return parts;
    }
    parseArgsAndFlags(tokens, valuedFlags = []) {
        const options = [];
        const args = [];
        const flagValues = {};
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.startsWith('-') && token.length > 1) {
                const isLong = token.startsWith('--');
                const cluster = isLong ? [token.slice(2)] : token.slice(1).split('');
                let valueCaptured = false;
                for (let j = 0; j < cluster.length; j++) {
                    const char = cluster[j];
                    const flagName = isLong ? `--${char}` : `-${char}`;
                    options.push(flagName);
                    if (valuedFlags.includes(char) || valuedFlags.includes(flagName)) {
                        if (!isLong && token.slice(j + 2).length > 0) {
                            flagValues[flagName] = token.slice(j + 2);
                            valueCaptured = true;
                            break;
                        }
                        else if (i + 1 < tokens.length) {
                            flagValues[flagName] = tokens[i + 1];
                            i++;
                            valueCaptured = true;
                            break;
                        }
                    }
                }
                if (valueCaptured)
                    continue;
            }
            else {
                args.push(token);
            }
        }
        return { options, args, flagValues };
    }
    expandGlobPatterns(args, fs) {
        const expanded = [];
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
            }
            else {
                expanded.push(arg);
            }
        }
        return expanded;
    }
    globToRegExp(pattern) {
        const escaped = pattern.replace(/([.+^${}()|[\]\\])/g, '\\$1');
        // '*' -> match any sequence, '?' -> match exactly one char
        const regexString = `^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`;
        return new RegExp(regexString);
    }
}
exports.CommandExecutor = CommandExecutor;
