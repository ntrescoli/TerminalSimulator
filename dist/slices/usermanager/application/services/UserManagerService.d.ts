import { Group } from '../../domain/entities/Group';
import { User } from '../../domain/entities/User';
import { IUserManagerRepository } from '../../domain/ports/out/IUserManagerRepository';
import { FileSystem } from '../../../filesystem/application/services/FileSystem';
/**
 * Gestiona la lógica de negocio de usuarios y grupos controlando la sincronización
 * de las cachés con los archivos /etc/passwd, /etc/group y /etc/shadow.
 */
export declare class UserManagerService {
    private readonly fs;
    private readonly repository;
    private cachedUsers;
    private cachedGroups;
    private lastUsersSync;
    private lastShadowSync;
    private lastGroupsSync;
    constructor(fs: FileSystem, repository: IUserManagerRepository);
    /** Comprueba si se ha modificado el archivo de usuarios o de contraseñas manualmente */
    private refreshUsers;
    /** Comprueba si se ha modificado el archivo de grupos manualmente */
    private refreshGroups;
    getUsers(): User[];
    getGroups(): Group[];
    getUserByName(username: string): User | undefined;
    getGroupByName(groupName: string): Group | undefined;
    /** Actualiza la contraseña de un usuario en el sistema */
    updatePassword(username: string, clearTextPassword: string): string | null;
    saveUser(user: User): string | null;
    deleteUser(username: string): string | null;
    saveGroup(group: Group): string | null;
    deleteGroup(groupName: string): string | null;
    addUserToGroup(username: string, groupName: string): string | null;
    hashPassword(password: string): string;
    loadDefaults(): void;
}
//# sourceMappingURL=UserManagerService.d.ts.map