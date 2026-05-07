import { User } from '../types/types';
import { FileSystem } from './FileSystem';

export class UserManager {
    private users: User[] = [];
    private fs: FileSystem;

    constructor(fs: FileSystem) {
        this.fs = fs;
        // Ya no creamos usuarios aquí, dejamos que el Kernel decida
    }

    /**
     * Carga una lista de usuarios (usado por el Kernel desde JSON)
     */
    public loadUsers(usersData: any[]) {
        this.users = usersData.map(u => ({
            username: u.username,
            uid: u.uid,
            gid: u.gid,
            home: u.home,
            shell: u.shell,
            fullName: u.fullName || u.username
        }));
        
        console.log(`UserManager: ${this.users.length} users loaded.`);
    }

    /**
     * Crea los usuarios por defecto (usado por el Kernel si falla el JSON)
     */
    public loadDefaults() {
        this.users = [
            { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', fullName: 'root' },
            { username: 'guest', uid: 1000, gid: 1000, home: '/home/guest', shell: '/bin/bash', fullName: 'Guest User' }
        ];
    }

    // public getUsers(): User[] {
    //     return this.users;
    // }

    /**
     * Parsea el archivo /etc/passwd y devuelve una lista de objetos User
     */
    public getUsers(): User[] {
        const content = this.fs.cat("/etc/passwd");
        if (content.includes("No such file")) return [];

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

        const userLine = `${user.username}:x:${user.uid}:${user.gid}:${user.fullName}:${user.home}:${user.shell}`;
        const currentContent = this.fs.cat("/etc/passwd");
        
        // Evitamos concatenar si el archivo está vacío o da error
        const cleanContent = currentContent.includes("No such file") ? "" : currentContent;
        const newContent = cleanContent ? `${cleanContent}\n${userLine}` : userLine;

        this.fs.writeFile("/etc/passwd", newContent);
        return null;
    }
}