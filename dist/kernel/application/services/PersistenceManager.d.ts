import { SystemOrchestrator } from './SystemOrchestrator';
export declare class PersistenceManager {
    private readonly envStateImpl;
    private readonly fsStateImpl;
    private readonly userStateImpl;
    private readonly groupStateImpl;
    private readonly jsonStorageImpl;
    constructor(orchestrator: SystemOrchestrator, initialStateUrl?: string);
    initSystem(orchestrator: SystemOrchestrator): Promise<void>;
    saveState(): Promise<void>;
    exportFullSystemState(history: string[]): {
        env: Record<string, string>;
        fileSystem: any;
        users: import('../../../slices/usermanager/domain/entities/User').User[];
        groups: import('../../../slices/usermanager/domain/entities/Group').Group[];
        history: string[];
    };
}
//# sourceMappingURL=PersistenceManager.d.ts.map