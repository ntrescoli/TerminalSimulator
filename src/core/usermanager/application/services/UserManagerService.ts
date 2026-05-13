// src/users/application/services/UserManagerService.ts
import { Group } from '../../domain/entities/Group';
import { User } from '../../domain/entities/User';
import { IUserManagerRepository } from '../../domain/ports/out/IUserManagerRepository';
import { FileSystem } from '../../../filesystem/domain/services/FileSystem';

/**
 * En el caso de Users y Groups, hay que comprobar si los archivos /etc/passwd y /etc/group han cambiado desde la última vez que se leyeron.
 * Si han cambiado, hay que volver a leerlos y actualizar la memoria interna de usuarios y grupos.
 * Si no han cambiado, se pueden devolver los usuarios y grupos almacenados en memoria caché.
 */
export class UserManagerService {
    private cachedUsers: User[] = [];
    private cachedGroups: Group[] = [];
    private lastUsersSync: number = -1;
    private lastGroupsSync: number = -1;

    constructor(private fs: FileSystem, private repository: IUserManagerRepository) { }

    //  --- SINCRONIZACIÓN DE CACHÉ ---

    /** Comprueba si se ha modificado el archivo de usuarios manualmente */
    private refreshUsers() {
        const mtime = this.fs.getModificationTime('/etc/passwd');
        if (mtime > this.lastUsersSync) {
            this.cachedUsers = this.repository.getUsers();
            this.lastUsersSync = mtime;
        }
    }

    /** Comprueba si se ha modificado el archivo de grupos manualmente */
    private refreshGroups() {
        const mtime = this.fs.getModificationTime('/etc/group');
        if (mtime > this.lastGroupsSync) {
            this.cachedGroups = this.repository.getGroups();
            this.lastGroupsSync = mtime;
        }
    }

    // --- CONSULTAS ---

    public getUsers(): User[] {
        this.refreshUsers();
        return this.cachedUsers;
    }

    public getGroups(): Group[] {
        this.refreshGroups();
        return this.cachedGroups;
    }

    public getUserByName(username: string): User | undefined {
        return this.getUsers().find(u => u.username === username);
    }

    public getGroupByName(groupName: string): Group | undefined {
        return this.getGroups().find(u => u.groupName === groupName);
    }

    // --- OPERACIONES ---

    public saveUser(user: User): string | null {
        this.refreshUsers();
        this.refreshGroups();

        if (this.cachedUsers.some(u => u.username === user.username)) {
            return `useradd: user '${user.username}' already exists`;
        }

        // Lógica de negocio: Crear grupo primario
        this.cachedGroups = [...this.cachedGroups, {
            groupName: user.username,
            gid: user.gid,
            members: [user.username]
        }];

        this.cachedUsers = [...this.cachedUsers, user];

        this.repository.saveUsers(this.cachedUsers);
        this.repository.saveGroups(this.cachedGroups);
        return null;
    }

    public deleteUser(username: string): string | null {
        this.refreshUsers();
        this.refreshGroups();

        if (username === 'root') return "deluser: cannot remove root";
        if (!this.cachedUsers.some(u => u.username === username)) return "user not found";

        const newUsers = this.cachedUsers.filter(u => u.username !== username);

        // Limpieza de grupos
        const newGroups = this.cachedGroups
            .filter(g => g.groupName !== username) // Borra grupo primario
            .map(g => ({ ...g, members: g.members.filter(m => m !== username) })); // Quita de otros

        this.repository.saveUsers(newUsers);
        this.repository.saveGroups(newGroups);
        return null;
    }

    public saveGroup(group: Group): string | null {
        this.refreshGroups();

        if (this.cachedGroups.find(g => g.groupName === group.groupName)) {
            return `addgroup: El grupo '${group.groupName}' ya existe.`;
        }
        if (this.cachedGroups.find(g => g.gid === group.gid)) {
            return `addgroup: El GID '${group.gid}' ya está en uso.`;
        }

        this.cachedGroups = [...this.cachedGroups, {
            groupName: group.groupName,
            gid: group.gid,
            members: []
        }];

        this.repository.saveGroups(this.cachedGroups);
        return null;
    }

    public deleteGroup(groupName: string): string | null {
        this.refreshUsers();
        this.refreshGroups();

        // 1. Protección de grupos del sistema
        if (groupName === 'root' || groupName === 'sudo') {
            return `delgroup: cannot remove system group '${groupName}'`;
        }

        // 2. Comprobar si el grupo existe
        if (!this.cachedGroups.some(g => g.groupName === groupName)) {
            return `delgroup: the group '${groupName}' does not exist`;
        }

        // 3. REGLA LINUX: No borrar un grupo si es el grupo primario de algún usuario
        // Buscamos en cachedUsers, no en cachedGroups
        const isPrimaryGroup = this.cachedUsers.some(u => u.username === groupName);
        if (isPrimaryGroup) {
            return `delgroup: group '${groupName}' is the primary group of a user`;
        }

        // 4. Crear el nuevo array de grupos (Inmutable)
        const newGroups = this.cachedGroups.filter(g => g.groupName !== groupName);

        // 5. Persistencia a través del repositorio
        this.repository.saveGroups(newGroups);

        // 6. Actualizar marca de tiempo para evitar re-lecturas innecesarias inmediatamente
        this.lastGroupsSync = this.fs.getModificationTime('/etc/group');

        return null;
    }

    public addUserToGroup(username: string, groupName: string): string | null {
        this.refreshUsers();
        this.refreshGroups();

        const group = this.cachedGroups.find(g => g.groupName === groupName);
        if (!group) return "group not found";
        if (group.members.includes(username)) return null;

        group.members.push(username);
        this.repository.saveGroups(this.cachedGroups);
        return null;
    }

    // --- CARGA INICIAL DESDE EL JSON EXTERNO ---

    /**
    * Sincroniza el array de usuarios con /etc/passwd
    */
    private updatePasswdFile() {
        const content = this.cachedUsers
            .map(u => `${u.username}:x:${u.uid}:${u.gid}:${u.fullName}:${u.home}:${u.shell}`)
            .join('\n');

        // Ahora devuelve un Result, pero aquí (sistema) solemos ignorarlo 
        // o podrías hacer un console.error si !result.success
        this.fs.writeFile('/etc/passwd', content);
    }

    /**
     * Sincroniza el array de grupos con /etc/group
     */
    private updateGroupFile() {
        const content = this.cachedGroups
            .map(g => `${g.groupName}:x:${g.gid}:${g.members.join(',')}`)
            .join('\n');

        this.fs.writeFile('/etc/group', content);
    }

    public loadUsers(usersData: any[]) {
        this.cachedUsers = usersData.map(u => ({
            username: u.username,
            uid: u.uid,
            gid: u.gid,
            home: u.home,
            shell: u.shell,
            fullName: u.fullName || u.username
        }));
        this.updatePasswdFile();
    }

    public loadGroups(groupsData: Group[]) {
        this.cachedGroups = [...groupsData];
        this.updateGroupFile();
    }

    // --- CARGA INICIAL DE SEGURIDAD (CENTRALIZAR EN EL FUTURO) ---

    public loadDefaults(): void {
        const defaultUsers: User[] = [
            { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', fullName: 'root' },
            { username: 'guest', uid: 1000, gid: 1000, home: '/home/guest', shell: '/bin/bash', fullName: 'Guest User' }
        ];

        const defaultGroups: Group[] = [
            { groupName: 'root', gid: 0, members: ['root'] },
            { groupName: 'guest', gid: 1000, members: ['guest'] }
        ];

        this.repository.saveUsers(defaultUsers);
        this.repository.saveGroups(defaultGroups);
        this.lastUsersSync = this.fs.getModificationTime('/etc/passwd');
        this.lastGroupsSync = this.fs.getModificationTime('/etc/group');
    }
}
// CRUD USERS
//   getUsers(): User[]
// getUserByName(username: string): User | undefined
// saveUser(user: User): string | null
// updateUser
// deleteUser(username: string): string | null

// addUserToGroup(username: string, groupName: string): string | null

// CRUD GROUPS
//   getGroups(): Group[]
// getGroupByName
// addGroup(group: Group): string | null
// updateGroup
// deleteGroup(groupName: string): string | null

// LOAD DATA
// loadUsers(usersData: any[]): void
// loadGroups(groupsData: Group[]): void
// loadDefaults(): void


// SAVE DATA
// updatePasswdFile(): void
// updateGroupFile():void


// UTILS
// parsePasswd(content: string): User[]


// Añadimos esto para el control de la caché
//   getModificationTime(): number;