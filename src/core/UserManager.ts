import { User, Group } from '../types/types';
import { FileSystem } from './FileSystem';

export class UserManager {
    private users: User[] = [];
    private groups: Group[] = [];
    private fs: FileSystem;

    constructor(fs: FileSystem) {
        this.fs = fs;
        // Ya no creamos usuarios aquí, dejamos que el Kernel decida
    }

    private updatePasswdFile() {
        const content = this.users
            .map(u => `${u.username}:x:${u.uid}:${u.gid}:${u.fullName}:${u.home}:${u.shell}`)
            .join('\n');
        this.fs.writeFile("/etc/passwd", content);
    }

    public loadUsers(usersData: any[]) {
        this.users = usersData.map(u => ({
            username: u.username,
            uid: u.uid,
            gid: u.gid,
            home: u.home,
            shell: u.shell,
            fullName: u.fullName || u.username
        }));
        this.updatePasswdFile(); // Sincronizamos con el FS virtual
    }

    public loadGroups(groupsData: Group[]) {
        this.groups = [...groupsData]; // Cargamos lo que viene del JSON
        this.updateGroupFile();
    }

    public loadDefaults() {
        this.users = [
            { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', fullName: 'root' },
            { username: 'guest', uid: 1000, gid: 1000, home: '/home/guest', shell: '/bin/bash', fullName: 'Guest User' }
        ];
        this.updatePasswdFile(); // Sincronizamos con el FS virtual
    }

    /**
     * Devuelve la lista de usuarios actual del array (la fuente de verdad)
     */
    public getUsers(): User[] {
        // Si el array está vacío, intentamos recuperarlo del archivo una vez
        if (this.users.length === 0) {
            const content = this.fs.cat("/etc/passwd");
            if (!content.includes("No such file") && content.trim() !== "") {
                this.users = this.parsePasswd(content);
            }
        }
        return this.users;
    }

    private parsePasswd(content: string): User[] {
        return content.split('\n')
            .filter(line => line.trim() !== "" && !line.startsWith("#"))
            .map(line => {
                const [username, , uid, gid, fullName, home, shell] = line.split(':');
                return {
                    username,
                    uid: parseInt(uid),
                    gid: parseInt(gid),
                    fullName: fullName || username,
                    home,
                    shell
                };
            });
    }

    /**
     * Busca un usuario por su nombre
     */
    public getUserByName(username: string): User | undefined {
        return this.getUsers().find(u => u.username === username);
    }

    /**
     * Guarda un nuevo usuario en el sistema
     */
    public saveUser(user: User): string | null {
        if (this.getUserByName(user.username)) {
            return `useradd: user '${user.username}' already exists`;
        }

        // 1. Crear el grupo privado para el usuario (Ubuntu style)
        // Usamos el mismo GID que el UID para mantener consistencia
        this.groups.push({
            groupName: user.username,
            gid: user.gid,
            members: [user.username]
        });

        // 2. Añadir el usuario al array
        this.users.push(user);

        // 3. Sincronizar ambos archivos en el FS virtual
        this.updatePasswdFile();
        this.updateGroupFile();

        return null;
    }

    public getGroups(): Group[] { return this.groups; }

    /**
     * Sincroniza el array de grupos con el archivo /etc/group
     */
    private updateGroupFile() {
        const content = this.groups
            .map(g => `${g.groupName}:x:${g.gid}:${g.members.join(',')}`)
            .join('\n');
        this.fs.writeFile("/etc/group", content);
    }

    /**
     * Crea un nuevo grupo
     */
    public addGroup(group: Group): string | null {
        // Verificar si el grupo ya existe
        if (this.groups.find(g => g.groupName === group.groupName)) {
            return `addgroup: El grupo '${group.groupName}' ya existe.`;
        }

        if (this.groups.find(g => g.gid === group.gid)) {
            return `addgroup: El GID '${group.gid}' ya está en uso.`;
        }

        this.groups.push(group);
        this.updateGroupFile(); // Sincroniza con el FS virtual (/etc/group)
        return null;
    }

    /**
     * Añade un usuario existente a un grupo existente
     */
    public addUserToGroup(username: string, groupName: string): string | null {
        // 1. Verificar que el usuario existe
        const user = this.users.find(u => u.username === username);
        if (!user) return `adduser: The user '${username}' does not exist.`;

        // 2. Verificar que el grupo existe
        const group = this.groups.find(g => g.groupName === groupName);
        if (!group) return `adduser: The group '${groupName}' does not exist.`;

        // 3. Añadir si no está ya presente
        if (!group.members.includes(username)) {
            group.members.push(username);
            this.updateGroupFile(); // Sincronizamos /etc/group
        }

        return null;
    }

    /**
     * Elimina un usuario y su grupo privado (si existe)
     */
    public deleteUser(username: string): string | null {
        if (username === 'root') return "deluser: cannot remove user 'root'";

        const userIndex = this.users.findIndex(u => u.username === username);
        if (userIndex === -1) return `deluser: the user '${username}' does not exist`;

        // 1. Eliminar al usuario del array
        this.users.splice(userIndex, 1);

        // 2. Eliminar al usuario de todos los grupos donde era miembro
        this.groups.forEach(group => {
            group.members = group.members.filter(m => m !== username);
        });

        // 3. Opcional: Eliminar su grupo privado (Ubuntu style)
        const groupIndex = this.groups.findIndex(g => g.groupName === username);
        if (groupIndex !== -1) this.groups.splice(groupIndex, 1);

        // 4. Sincronizar archivos
        this.updatePasswdFile();
        this.updateGroupFile();

        return null;
    }

    /**
     * Elimina un grupo
     */
    public deleteGroup(groupName: string): string | null {
        if (groupName === 'root' || groupName === 'sudo') {
            return `delgroup: cannot remove system group '${groupName}'`;
        }

        const groupIndex = this.groups.findIndex(g => g.groupName === groupName);
        if (groupIndex === -1) return `delgroup: the group '${groupName}' does not exist`;

        // Verificar si hay usuarios que dependen de este grupo como grupo principal
        const hasDependents = this.users.some(u => u.username === groupName);
        if (hasDependents) return `delgroup: group '${groupName}' is the primary group of a user`;

        this.groups.splice(groupIndex, 1);
        this.updateGroupFile();

        return null;
    }
}