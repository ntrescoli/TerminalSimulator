import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import { PathResolver } from '../../../slices/filesystem/application/services/PathResolver';
import { Environment } from '../../../slices/system/domain/entities/Environment';
import { UserManagerService } from '../../../slices/usermanager/application/services/UserManagerService';

export class SystemOrchestrator {
    readonly fileSystem: FileSystem;
    readonly environment: Environment;
    readonly userManager: UserManagerService;

    constructor(
        fileSystem: FileSystem,
        environment: Environment,
        userManager: UserManagerService
    ) {
        this.fileSystem = fileSystem;
        this.environment = environment;
        this.userManager = userManager;
    }

    public generatePromptText(): string {
        const user = this.environment.get('USER') || 'guest';
        const host = this.environment.get('HOSTNAME') || 'js-terminal';
        const path = PathResolver.getAbsolutePath(this.fileSystem.getCurrentDirectory());
        return `${user}@${host}:${path}$ `;
    }

    public getCompletions(input: string): string[] {
        const tokens = input.split(/\s+/);
        const lastToken = tokens[tokens.length - 1];

        const lastSlashIndex = lastToken.lastIndexOf('/');
        let partialName = lastToken;
        let pathPrefix = '';
        let searchDirNode;

        if (lastSlashIndex !== -1) {
            pathPrefix = lastToken.substring(0, lastSlashIndex + 1);
            partialName = lastToken.substring(lastSlashIndex + 1);
            searchDirNode = PathResolver.resolve(
                pathPrefix,
                this.fileSystem.getCurrentDirectory(),
                this.fileSystem.getRoot()
            );
        } else {
            searchDirNode = this.fileSystem.getCurrentDirectory();
        }

        if (!searchDirNode || searchDirNode.type !== 'dir') return [];

        return searchDirNode.children
            .filter(child => child.name.startsWith(partialName))
            .map(child => {
                const suffix = child.type === 'dir' ? '/' : ' ';
                return pathPrefix + child.name + suffix;
            });
    }

    public loadDefaults(): void {
        this.environment.loadDefaults();
        this.fileSystem.loadDefaults();
        this.userManager.loadDefaults();
    }
}
