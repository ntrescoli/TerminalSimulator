import type { IStorageRepository } from '@/kernel/domain/ports/out/IStorageRepository';
import type { Environment } from '@/slices/system/domain/entities/Environment';
import type { UserManagerService } from '@/slices/usermanager/application/services/UserManagerService';
import type { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';

export class DefaultStorageRepositoryImpl implements IStorageRepository {
    constructor(
        private readonly env: Environment,
        private readonly fs: FileSystem, 
        private readonly userManager: UserManagerService,
    ) { }

    public loadData() {
        console.warn('Kernel: Error loading config, using defaults.');
        // Environment
        this.env.loadDefaults();
        // FileSystem
        this.fs.loadDefaults();
        // Users and Groups   
        this.userManager.loadDefaults();
    }

    public saveData(){
        return 'This is a free plan. Upgrade to Pro to enable savestates.';
    }

}