import { Group } from '../../domain/entities/Group';
import { User } from '../../domain/entities/User';
import { IUserManagerRepository } from '../../domain/ports/out/IUserManagerRepository';
import { FileSystem } from '../../../filesystem/application/services/FileSystem';

/**
 * Guardado y Recuperación en Archivos Virtuales (passwd y groups)
 */
export class UserManagerRepositoryImpl implements IUserManagerRepository {
    constructor(private fs: FileSystem) { }

    public getUsers(): User[] {
    const res = this.fs.cat('/etc/passwd');
    if (!res.isSuccess) return [];
    const content = res.getValue();
    const users = this.parsePasswd(content);

    const shadowRes = this.fs.catSystem('/etc/shadow');
    if (shadowRes.isSuccess) {
        const shadowMap = this.parseShadow(shadowRes.getValue());

        users.forEach(u => {
            if (shadowMap.has(u.username)) {
                u.password = shadowMap.get(u.username);
            }
        });
    }

    return users;
}

    public getGroups(): Group[] {
        const result = this.fs.cat('/etc/group');
        if (!result.isSuccess) return [];
        const content = result.getValue();
        return this.parseGroups(content);
    }

    public saveUsers(users: User[]): void {
        const content = users
            .map(u => `${u.username}:x:${u.uid}:${u.gid}:${u.fullName}:${u.home}:${u.shell}`)
            .join('\n');
        this.fs.writeFile('/etc/passwd', content);

        // 2. Escribir /etc/shadow de forma consistente
        const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

        // Intentamos leer el shadow actual para no perder hashes de usuarios existentes si su entidad no los trae
        const currentShadow = this.fs.cat('/etc/shadow');
        const currentShadowMap = currentShadow.isSuccess ? this.parseShadow(currentShadow.getValue()) : new Map<string, string>();

        const shadowContent = users
            .map(u => {
                // Prioridad del hash: 
                // 1. El que venga en la entidad modificado (ej: por passwd)
                // 2. El que ya existiera en el archivo shadow previamente
                // 3. Un hash de password por defecto si es un usuario totalmente nuevo sin contraseña asignada
                const hash = u.password || currentShadowMap.get(u.username) || "$6$rounds=5000$jsTerminalSalt$c37ce20fffffffff";
                return `${u.username}:${hash}:${daysSinceEpoch}:0:99999:7:::`;
            })
            .join('\n') + '\n';

        this.fs.writeFile('/etc/shadow', shadowContent);
    }

    public saveGroups(groups: Group[]): void {
        const content = groups
            .map(g => `${g.groupName}:x:${g.gid}:${g.members.join(',')}`)
            .join('\n');
        this.fs.writeFile('/etc/group', content);
    }

    // -- UTILS --

    private parsePasswd(content: string): User[] {
        return content.split('\n')
            .map(l => l.trim())
            .filter(l => l !== "" && !l.startsWith("#"))
            .map(line => {
                const [username, , uid, gid, fullName, home, shell] = line.split(':');
                return {
                    username,
                    uid: parseInt(uid, 10) || 0,
                    gid: parseInt(gid, 10) || 0,
                    fullName: fullName || username,
                    home: home || `/home/${username}`,
                    shell: shell || '/bin/bash'
                };
            });
    }

    private parseShadow(content: string): Map<string, string> {
        const shadowMap = new Map<string, string>();

        content.split('\n')
            .map(l => l.trim())
            .filter(l => l !== "" && !l.startsWith("#"))
            .forEach(line => {
                const [username, passwordHash] = line.split(':');
                // 🌟 Evaluamos de forma segura si existen las posiciones en el split, 
                // evitando que un string vacío ("") nos rompa la validación.
                if (username !== undefined && passwordHash !== undefined) {
                    shadowMap.set(username, passwordHash);
                }
            });

        return shadowMap;
    }

    private parseGroups(content: string): Group[] {
        return content.split('\n')
            .map(l => l.trim())
            .filter(l => l !== "" && !l.startsWith("#"))
            .map(line => {
                const [groupName, , gid, membersStr] = line.split(':');
                const members = membersStr?.trim() ? membersStr.split(',') : [];
                return { groupName, gid: parseInt(gid, 10) || 0, members };
            });
    }
}