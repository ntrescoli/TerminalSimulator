import { IStorageRepository } from '@/kernel/domain/ports/out/IStorageRepository';
import { Environment } from '@/slices/system/domain/entities/Environment';
import { UserManagerService } from '@/slices/usermanager/application/services/UserManagerService';
import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';

export class DefaultStorageRepositoryImpl implements IStorageRepository {
    constructor(
        private env: Environment,
        private fs: FileSystem, 
        private userManager: UserManagerService
    ) { }

    public loadData() {
        console.warn("Kernel: Error loading config, using defaults.");
        // Environment
        this.env.loadDefaults();
        // FileSystem
        this.fs.loadDefaults();
        // Users and Groups   
        this.userManager.loadDefaults();
    }

    public saveData(){
        return 'This is a free plan. Upgrade to Pro to enable savestates.'
    }

}