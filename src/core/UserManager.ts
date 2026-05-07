import { User } from '../types/types';
import { FileSystem } from './FileSystem';

export class UserManager {
    private users: User[] = [];
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

        this.users.push(user);
        this.updatePasswdFile();
        return null;
    }
}