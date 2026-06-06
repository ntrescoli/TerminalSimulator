import { FileSystem } from '../application/services/FileSystem';
export declare class DefaultStorageRepositoryImpl {
    private readonly fs;
    constructor(fs: FileSystem);
    loadDefaults(): void;
    saveDefaults(): string;
}
//# sourceMappingURL=DefaultStorageRepositoryImpl.d.ts.map