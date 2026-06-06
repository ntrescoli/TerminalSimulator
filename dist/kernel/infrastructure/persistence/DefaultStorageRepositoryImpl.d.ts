import { IStorageRepository } from '../../domain/ports/out/IStorageRepository';
import { Environment } from '../../../slices/system/domain/entities/Environment';
import { UserManagerService } from '../../../slices/usermanager/application/services/UserManagerService';
import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
export declare class DefaultStorageRepositoryImpl implements IStorageRepository {
    private readonly env;
    private readonly fs;
    private readonly userManager;
    constructor(env: Environment, fs: FileSystem, userManager: UserManagerService);
    loadData(): void;
    saveData(): string;
}
//# sourceMappingURL=DefaultStorageRepositoryImpl.d.ts.map