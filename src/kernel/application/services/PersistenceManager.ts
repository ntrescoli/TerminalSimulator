import { FileSystemStateSaverImpl } from '../../../slices/filesystem/infrastructure/FileSystemStateSaverImpl';
import { EnvironmentStateSaverImpl } from '../../../slices/system/infrastructure/EnvironmentStateSaverImpl';
import { GroupStateSaverImpl } from '../../../slices/usermanager/infrastructure/persistence/GroupStateSaverImpl';
import { UserStateSaverImpl } from '../../../slices/usermanager/infrastructure/persistence/UserStateSaverImpl';
import { JsonStorageRepositoryImpl } from '../../infrastructure/persistence/JsonStorageRepositoryImpl';
import type { SystemOrchestrator } from './SystemOrchestrator';

export class PersistenceManager {
    private readonly envStateImpl: EnvironmentStateSaverImpl;
    private readonly fsStateImpl: FileSystemStateSaverImpl;
    private readonly userStateImpl: UserStateSaverImpl;
    private readonly groupStateImpl: GroupStateSaverImpl;
    private readonly jsonStorageImpl: JsonStorageRepositoryImpl;

    constructor(orchestrator: SystemOrchestrator) {
        this.envStateImpl = new EnvironmentStateSaverImpl(orchestrator.environment);
        this.fsStateImpl = new FileSystemStateSaverImpl(orchestrator.fileSystem);
        this.userStateImpl = new UserStateSaverImpl(orchestrator.userManager);
        this.groupStateImpl = new GroupStateSaverImpl(orchestrator.userManager);

        const stateSavers = [
            this.envStateImpl,
            this.fsStateImpl,
            this.userStateImpl,
            this.groupStateImpl,
        ];

        this.jsonStorageImpl = new JsonStorageRepositoryImpl(stateSavers);
    }

    public async initSystem(orchestrator: SystemOrchestrator): Promise<void> {
        try {
            await this.jsonStorageImpl.loadData();
        } catch {
            console.warn('PersistenceManager: Error loading config, using defaults.');
            orchestrator.loadDefaults();
        }
    }

    public async saveState(): Promise<void> {
        await this.jsonStorageImpl.saveData();
    }

    public exportFullSystemState(history: string[]) {
        return {
            env: this.envStateImpl.getState(),
            fileSystem: this.fsStateImpl.getState(),
            users: this.userStateImpl.getState(),
            groups: this.groupStateImpl.getState(),
            history,
        };
    }
}
