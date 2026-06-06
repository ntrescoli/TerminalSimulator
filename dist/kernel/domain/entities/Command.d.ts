import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import { Environment } from '../../../slices/system/domain/entities/Environment';
import { UserManagerService } from '../../../slices/usermanager/application/services/UserManagerService';
export interface CommandContext {
    args: string[];
    options: string[];
    rawArgs: string[];
    flagValues: {
        [key: string]: string;
    };
    fs: FileSystem;
    env: Environment;
    userManager: UserManagerService;
    hasFlag: (flag: string) => boolean;
    pipeInput?: string;
    signal?: AbortSignal;
    kernel: any;
    rawInput?: string;
}
export interface ICommand {
    name: string;
    alias?: string[];
    valuedFlags?: string[];
    execute: (context: CommandContext) => Promise<string> | string;
}
//# sourceMappingURL=Command.d.ts.map