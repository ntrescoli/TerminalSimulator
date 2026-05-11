import { Group, User } from '../types/types';
import { Result } from '../types/system'
import { FileSystem } from './FileSystem';

export class UserManager {
    private users: User[] = [];
    private groups: Group[] = [];
    private fs: FileSystem;

    constructor(fs: FileSystem) {
        this.fs = fs;
    }

    /**
     * Sincroniza el array de usuarios con /etc/passwd
     */
    private updatePasswdFile() {
        const content = this.users
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
        const content = this.groups
            .map(g => `${g.groupName}:x:${g.gid}:${g.members.join(',')}`)
            .join('\n');

        this.fs.writeFile('/etc/group', content);
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
        this.updatePasswdFile();
    }

    public loadGroups(groupsData: Group[]) {
        this.groups = [...groupsData];
        this.updateGroupFile();
    }

    public loadDefaults() {
        this.users = [
            { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', fullName: 'root' },
            { username: 'guest', uid: 1000, gid: 1000, home: '/home/guest', shell: '/bin/bash', fullName: 'Guest User' }
        ];

        // Inicializamos grupos por defecto para estos usuarios
        this.groups = [
            { groupName: 'root', gid: 0, members: ['root'] },
            { groupName: 'guest', gid: 1000, members: ['guest'] }
        ];

        this.updatePasswdFile();
        this.updateGroupFile();
    }

    public getUsers(): User[] {
        if (this.users.length === 0) {
            // fs.cat ahora devuelve un Result<string>
            const result = this.fs.cat("/etc/passwd");

            if (result.success && result.data.trim() !== "") {
                this.users = this.parsePasswd(result.data);
            }
        }
        return this.users;
    }

    /**
     * Devuelve la lista de grupos actual
     */
    public getGroups(): Group[] {
        return this.groups;
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

    public getUserByName(username: string): User | undefined {
        return this.getUsers().find(u => u.username === username);
    }

    // --- MÉTODOS DE ESCRITURA (Usamos string | null para errores de lógica de negocio) ---

    public saveUser(user: User): string | null {
        if (this.getUserByName(user.username)) {
            return `useradd: user '${user.username}' already exists`;
        }

        this.groups.push({
            groupName: user.username,
            gid: user.gid,
            members: [user.username]
        });

        this.users.push(user);
        this.updatePasswdFile();
        this.updateGroupFile();
        return null;
    }

    public addGroup(group: Group): string | null {
        if (this.groups.find(g => g.groupName === group.groupName)) {
            return `addgroup: El grupo '${group.groupName}' ya existe.`;
        }
        if (this.groups.find(g => g.gid === group.gid)) {
            return `addgroup: El GID '${group.gid}' ya está en uso.`;
        }

        this.groups.push(group);
        this.updateGroupFile();
        return null;
    }

    public addUserToGroup(username: string, groupName: string): string | null {
        const user = this.users.find(u => u.username === username);
        if (!user) return `adduser: The user '${username}' does not exist.`;

        const group = this.groups.find(g => g.groupName === groupName);
        if (!group) return `adduser: The group '${groupName}' does not exist.`;

        if (!group.members.includes(username)) {
            group.members.push(username);
            this.updateGroupFile();
        }
        return null;
    }

    public deleteUser(username: string): string | null {
        if (username === 'root') return "deluser: cannot remove user 'root'";

        const userIndex = this.users.findIndex(u => u.username === username);
        if (userIndex === -1) return `deluser: the user '${username}' does not exist`;

        this.users.splice(userIndex, 1);
        this.groups.forEach(group => {
            group.members = group.members.filter(m => m !== username);
        });

        const groupIndex = this.groups.findIndex(g => g.groupName === username);
        if (groupIndex !== -1) this.groups.splice(groupIndex, 1);

        this.updatePasswdFile();
        this.updateGroupFile();
        return null;
    }

    public deleteGroup(groupName: string): string | null {
        if (groupName === 'root' || groupName === 'sudo') {
            return `delgroup: cannot remove system group '${groupName}'`;
        }

        const groupIndex = this.groups.findIndex(g => g.groupName === groupName);
        if (groupIndex === -1) return `delgroup: the group '${groupName}' does not exist`;

        const hasDependents = this.users.some(u => u.username === groupName);
        if (hasDependents) return `delgroup: group '${groupName}' is the primary group of a user`;

        this.groups.splice(groupIndex, 1);
        this.updateGroupFile();
        return null;
    }
}