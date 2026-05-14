import { Kernel } from '@/kernel/Kernel';
import { IStorageRepository } from '@/kernel/domain/ports/out/IStorageRepository';
import { FileSystem } from '@/slices/filesystem/application/services/FileSystem';
import { Environment } from '@/slices/system/domain/entities/Environment';
import { UserManagerService } from '@/slices/usermanager/application/services/UserManagerService';

export class JsonStorageRepositoryImpl implements IStorageRepository {
    constructor(
        private env: Environment,
        private fs: FileSystem,
        private userManager: UserManagerService,
        private kernel: Kernel
    ) { }

    public async loadData() {
        const response = await fetch('vms/default.json');
        if (!response.ok) throw new Error();
        const config = await response.json();

        this.fs.loadFromJSON(config);
        if (config.users) this.userManager.loadUsers(config.users);
        if (config.groups) this.userManager.loadGroups(config.groups);

        if (config.env) {
            this.env.loadFromObject(config.env);
        } else {
            this.env.loadDefaults();
        }
        if (config.history) this.kernel.loadHistory(config.history);
    }

    public async saveData() {
        return {
            env: this.env.getAll(),
            fileSystem: this.fs.serialize(),
            users: this.userManager.getUsers(),
            groups: this.userManager.getGroups(),
            history: this.kernel.getHistory()
        };
    }
}