import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import { Environment } from '../../../slices/system/domain/entities/Environment';
import { UserManagerService } from '../../../slices/usermanager/application/services/UserManagerService';
export declare class SystemOrchestrator {
    readonly fileSystem: FileSystem;
    readonly environment: Environment;
    readonly userManager: UserManagerService;
    constructor(fileSystem: FileSystem, environment: Environment, userManager: UserManagerService);
    generatePromptText(): string;
    getCompletions(input: string): string[];
    loadDefaults(): void;
}
//# sourceMappingURL=SystemOrchestrator.d.ts.map