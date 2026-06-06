import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import { Environment } from '../../../slices/system/domain/entities/Environment';
import { UserManagerService } from '../../../slices/usermanager/application/services/UserManagerService';
import { ICommand } from '../../domain/entities/Command';
export declare class CommandExecutor {
    private readonly env;
    constructor(env: Environment);
    execute(input: string, commands: Map<string, ICommand>, fs: FileSystem, userManager: UserManagerService, kernel?: any, signal?: AbortSignal): Promise<string>;
    private processCommandLine;
    tokenize(input: string): string[];
    parseArgsAndFlags(tokens: string[], valuedFlags?: string[], allowedFlags?: Set<string>): {
        options: string[];
        args: string[];
        flagValues: {
            [key: string]: string;
        };
    };
    private expandGlobPatterns;
    private globToRegExp;
    private extractAllowedFlagsFromCommand;
}
//# sourceMappingURL=CommandExecutor.d.ts.map