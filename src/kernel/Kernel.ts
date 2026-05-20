import { FileSystem } from '../slices/filesystem/application/services/FileSystem';
import { Environment } from '../slices/system/domain/entities/Environment';
import { UserManagerService } from '../slices/usermanager/application/services/UserManagerService';
import { UserManagerRepositoryImpl } from '../slices/usermanager/infrastructure/persistence/UserManagerRepositoryImpl';
import { CommandExecutor } from './application/services/CommandExecutor';
import { CommandRegistry } from './application/services/CommandRegistry';
import { PersistenceManager } from './application/services/PersistenceManager';
import { SystemOrchestrator } from './application/services/SystemOrchestrator';

export class Kernel {
    private startTime: number;
    private history: string[] = [];
    private isReady: boolean = false;

    private executor: CommandExecutor;
    private registry: CommandRegistry;
    private orchestrator: SystemOrchestrator;
    private persistence: PersistenceManager;

    constructor() {
        this.startTime = Date.now();

        const env = new Environment();
        const fs = new FileSystem(env);
        const userRepo = new UserManagerRepositoryImpl(fs);
        const userManager = new UserManagerService(fs, userRepo);

        this.orchestrator = new SystemOrchestrator(fs, env, userManager);
        this.executor = new CommandExecutor(env);
        this.registry = new CommandRegistry();
        this.persistence = new PersistenceManager(this.orchestrator);
    }

    public async boot(): Promise<void> {
        if (this.isReady) return;
        await this.persistence.initSystem(this.orchestrator);
        this.isReady = true;
    }

    public async execute(input: string, skipHistory: boolean = false, signal?: AbortSignal): Promise<string> {
        const trimmedInput = input.trim();
        if (!trimmedInput) return "";

        if (!skipHistory) {
            this.history.push(trimmedInput);
        }

        try {
            return await this.executor.execute(
                trimmedInput,
                this.registry.getAllCommands(),
                this.orchestrator.fileSystem,
                this.orchestrator.userManager,
                this,
                signal
            );
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                return 'COMMAND_ABORTED';
            }
            throw error;
        }
    }

    public getPromptText(): string {
        return this.orchestrator.generatePromptText();
    }

    public getCompletions(input: string): string[] {
        const tokens = input.split(/\s+/);
        const lastToken = tokens[tokens.length - 1];

        if (tokens.length === 1 && !input.endsWith(' ')) {
            return Array.from(this.registry.getAllCommands().keys())
                .filter(name => name.startsWith(lastToken.toLowerCase()))
                .map(name => name + ' ');
        }

        return this.orchestrator.getCompletions(input);
    }

    public getHistory(): string[] {
        return this.history;
    }

    public clearHistory(): void {
        this.history = [];
    }

    public getUptime(): number {
        return Date.now() - this.startTime;
    }

    public exportFullSystemState() {
        return this.persistence.exportFullSystemState(this.history);
    }
}
