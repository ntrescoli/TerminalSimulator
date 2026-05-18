import { Group } from '../../domain/entities/Group';
import { User } from '../../domain/entities/User';
import { IUserManagerRepository } from '../../domain/ports/out/IUserManagerRepository';
import { FileSystem } from '../../../filesystem/application/services/FileSystem';

/**
 * Gestiona la lógica de negocio de usuarios y grupos controlando la sincronización
 * de las cachés con los archivos /etc/passwd, /etc/group y /etc/shadow.
 */
export class UserManagerService {
    private cachedUsers: User[] = [];
    private cachedGroups: Group[] = [];
    private lastUsersSync: number = -1;
    private lastShadowSync: number = -1; // 🌟 Nueva marca para trackear /etc/shadow
    private lastGroupsSync: number = -1;

    constructor(private fs: FileSystem, private repository: IUserManagerRepository) { }

    //  --- SINCRONIZACIÓN DE CACHÉ ---

    /** Comprueba si se ha modificado el archivo de usuarios o de contraseñas manualmente */
    private refreshUsers() {
        const passwdMtime = this.fs.getModificationTime('/etc/passwd');
        const shadowMtime = this.fs.getModificationTime('/etc/shadow');

        // 🌟 Si ha cambiado passwd O ha cambiado shadow, invalidamos la caché y recargamos
        if (passwdMtime > this.lastUsersSync || shadowMtime > this.lastShadowSync) {
            const diskUsers = this.repository.getUsers();

            // CONTROL DE ASINCRONÍA: Solo pisamos la caché si el disco contiene usuarios.
            if (diskUsers && diskUsers.length > 0) {
                this.cachedUsers = diskUsers;
            }

            this.lastUsersSync = passwdMtime;
            this.lastShadowSync = shadowMtime;
        }
    }

    /** Comprueba si se ha modificado el archivo de grupos manualmente */
    private refreshGroups() {
        const mtime = this.fs.getModificationTime('/etc/group');
        if (mtime > this.lastGroupsSync) {
            const diskGroups = this.repository.getGroups();

            if (diskGroups && diskGroups.length > 0) {
                this.cachedGroups = diskGroups;
            }

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

    /** Actualiza la contraseña de un usuario en el sistema */
    public updatePassword(username: string, clearTextPassword: string): string | null {
        this.refreshUsers();

        const user = this.cachedUsers.find(u => u.username === username);
        if (!user) {
            return `passwd: user '${username}' not found`;
        }

        // Ciframos la contraseña usando tu algoritmo nativo
        user.password = this.hashPassword(clearTextPassword);

        // Guardamos la lista de usuarios. El repositorio se encargará de actualizar /etc/shadow
        this.repository.saveUsers(this.cachedUsers);

        // Actualizamos marcas de sincronización del archivo modificado
        this.lastShadowSync = this.fs.getModificationTime('/etc/shadow');
        return null;
    }

    public saveUser(user: User): string | null {
        this.refreshUsers();
        this.refreshGroups();

        if (Array.isArray(user)) {
            return "userManager: cannot save an array of users via saveUser";
        }

        if (this.cachedUsers.some(u => u && !Array.isArray(u) && u.username === user.username)) {
            return `useradd: user '${user.username}' already exists`;
        }

        this.cachedGroups = [...this.cachedGroups.filter(g => g && !Array.isArray(g)), {
            groupName: user.username,
            gid: user.gid,
            members: [user.username]
        }];

        const cleanUsers = this.cachedUsers.filter(u => u && !Array.isArray(u));
        this.cachedUsers = [...cleanUsers, user];

        this.repository.saveUsers(this.cachedUsers);
        this.repository.saveGroups(this.cachedGroups);

        this.lastUsersSync = this.fs.getModificationTime('/etc/passwd');
        this.lastShadowSync = this.fs.getModificationTime('/etc/shadow'); // Sincronizamos shadow tras el guardado
        this.lastGroupsSync = this.fs.getModificationTime('/etc/group');
        return null;
    }

    public deleteUser(username: string): string | null {
        this.refreshUsers();
        this.refreshGroups();

        if (username === 'root') return "deluser: cannot remove root";
        if (!this.cachedUsers.some(u => u.username === username)) return "user not found";

        const newUsers = this.cachedUsers.filter(u => u.username !== username);

        const newGroups = this.cachedGroups
            .filter(g => g.groupName !== username)
            .map(g => ({ ...g, members: g.members.filter(m => m !== username) }));

        this.repository.saveUsers(newUsers);
        this.repository.saveGroups(newGroups);
        
        this.lastUsersSync = this.fs.getModificationTime('/etc/passwd');
        this.lastShadowSync = this.fs.getModificationTime('/etc/shadow');
        return null;
    }

    public saveGroup(group: Group): string | null {
        this.refreshGroups();

        if (Array.isArray(group)) {
            return "userManager: cannot save an array of groups via saveGroup";
        }

        const cleanGroups = this.cachedGroups.filter(g => g && !Array.isArray(g));

        if (cleanGroups.some(g => g.groupName === group.groupName)) {
            return `addgroup: El grupo '${group.groupName}' ya existe.`;
        }
        if (cleanGroups.some(g => g.gid === group.gid)) {
            return `addgroup: El GID '${group.gid}' ya está en uso.`;
        }

        this.cachedGroups = [...cleanGroups, {
            groupName: group.groupName,
            gid: group.gid,
            members: Array.isArray(group.members) ? group.members : []
        }];

        this.repository.saveGroups(this.cachedGroups);
        this.lastGroupsSync = this.fs.getModificationTime('/etc/group');

        return null;
    }

    public deleteGroup(groupName: string): string | null {
        this.refreshUsers();
        this.refreshGroups();

        if (groupName === 'root' || groupName === 'sudo') {
            return `delgroup: cannot remove system group '${groupName}'`;
        }

        if (!this.cachedGroups.some(g => g.groupName === groupName)) {
            return `delgroup: the group '${groupName}' does not exist`;
        }

        const isPrimaryGroup = this.cachedUsers.some(u => u.username === groupName);
        if (isPrimaryGroup) {
            return `delgroup: group '${groupName}' is the primary group of a user`;
        }

        const newGroups = this.cachedGroups.filter(g => g.groupName !== groupName);
        this.repository.saveGroups(newGroups);
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
        this.lastGroupsSync = this.fs.getModificationTime('/etc/group');
        return null;
    }

    public hashPassword(password: string): string {
        let hash = 0;
        if (password.length === 0) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

        for (let i = 0; i < password.length; i++) {
            const chr = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }

        return `$6$rounds=5000$jsTerminalSalt$${Math.abs(hash).toString(16).padEnd(16, 'f')}`;
    }

    public loadDefaults(): void {
        const defaultUsers: User[] = [
            { username: 'root', password: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', fullName: 'root' },
            { username: 'guest', password: 'guest', uid: 1000, gid: 1000, home: '/home/guest', shell: '/bin/bash', fullName: 'Guest User' }
        ];

        const defaultGroups: Group[] = [
            { groupName: 'root', gid: 0, members: ['root'] },
            { groupName: 'guest', gid: 1000, members: ['guest'] }
        ];

        this.repository.saveUsers(defaultUsers);
        this.repository.saveGroups(defaultGroups);
        this.lastUsersSync = this.fs.getModificationTime('/etc/passwd');
        this.lastShadowSync = this.fs.getModificationTime('/etc/shadow');
        this.lastGroupsSync = this.fs.getModificationTime('/etc/group');
    }
}

// // CRUD USERS
// //   getUsers(): User[]
// // getUserByName(username: string): User | undefined
// // saveUser(user: User): string | null
// // updateUser
// // deleteUser(username: string): string | null

// // addUserToGroup(username: string, groupName: string): string | null

// // CRUD GROUPS
// //   getGroups(): Group[]
// // getGroupByName
// // addGroup(group: Group): string | null
// // updateGroup
// // deleteGroup(groupName: string): string | null

// // LOAD DATA
// // loadUsers(usersData: any[]): void
// // loadGroups(groupsData: Group[]): void
// // loadDefaults(): void


// // SAVE DATA
// // updatePasswdFile(): void
// // updateGroupFile():void


// // UTILS
// // parsePasswd(content: string): User[]


// // Añadimos esto para el control de la caché
// //   getModificationTime(): number;