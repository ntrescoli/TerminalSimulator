import { User } from '../types/types';
import { FileSystem } from './FileSystem';

export class UserManager {
    constructor(private fs: FileSystem) {}

    /**
     * Parsea el archivo /etc/passwd y devuelve una lista de objetos User
     */
    getUsers(): User[] {
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
    getUserByName(username: string): User | undefined {
        return this.getUsers().find(u => u.username === username);
    }

    /**
     * Guarda un nuevo usuario en el sistema
     */
    saveUser(user: User): string | null {
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