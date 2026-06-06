export declare class Kernel {
    private readonly startTime;
    private history;
    private isReady;
    private readonly executor;
    private readonly registry;
    private readonly orchestrator;
    private readonly persistence;
    constructor(initialStateUrl?: string);
    boot(): Promise<void>;
    execute(input: string, skipHistory?: boolean, signal?: AbortSignal): Promise<string>;
    getPromptText(): string;
    getCompletions(input: string): string[];
    getHistory(): string[];
    clearHistory(): void;
    getUptime(): number;
    exportFullSystemState(): {
        env: Record<string, string>;
        fileSystem: any;
        users: import('../slices/usermanager/domain/entities/User').User[];
        groups: import('../slices/usermanager/domain/entities/Group').Group[];
        history: string[];
    };
}
//# sourceMappingURL=Kernel.d.ts.map