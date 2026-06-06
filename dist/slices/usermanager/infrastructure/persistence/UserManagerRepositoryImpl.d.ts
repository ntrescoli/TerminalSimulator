import { Group } from '../../domain/entities/Group';
import { User } from '../../domain/entities/User';
import { IUserManagerRepository } from '../../domain/ports/out/IUserManagerRepository';
import { FileSystem } from '../../../filesystem/application/services/FileSystem';
/**
 * Guardado y Recuperación en Archivos Virtuales (passwd y groups)
 */
export declare class UserManagerRepositoryImpl implements IUserManagerRepository {
    private readonly fs;
    constructor(fs: FileSystem);
    getUsers(): User[];
    getGroups(): Group[];
    saveUsers(users: User[]): void;
    saveGroups(groups: Group[]): void;
    private parsePasswd;
    private parseShadow;
    private parseGroups;
}
//# sourceMappingURL=UserManagerRepositoryImpl.d.ts.map