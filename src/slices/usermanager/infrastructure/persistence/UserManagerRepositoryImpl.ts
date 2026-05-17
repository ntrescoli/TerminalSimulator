import { Group } from '../../domain/entities/Group';
import { User } from '../../domain/entities/User';
import { IUserManagerRepository } from '../../domain/ports/out/IUserManagerRepository';
import { FileSystem } from '../../../filesystem/application/services/FileSystem';
import { Result } from '../../../../result/Result';

/**
 * Guardado y Recuperación en Archivos Virtuales (passwd y groups)
 */
export class UserManagerRepositoryImpl implements IUserManagerRepository {
    constructor(private fs: FileSystem) { }

    public getUsers(): User[] {
        const res = this.fs.cat('/etc/passwd');
        // return res.isSuccess ? this.parsePasswd(res.value) : [];
        if (!res.isSuccess) return [];
        const content = typeof res.getValue === 'function' ? res.getValue() : (res as any).value;
        return this.parsePasswd(content);
    }

    public getGroups(): Group[] {
        const result = this.fs.cat('/etc/group');
        // return result.isSuccess ? this.parseGroups(result.value) : [];
        if (!result.isSuccess) return [];
        const content = typeof result.getValue === 'function' ? result.getValue() : (result as any).value;
        return this.parseGroups(content);
    }

    public saveUsers(users: User[]): void {
        const content = users
            .map(u => `${u.username}:x:${u.uid}:${u.gid}:${u.fullName}:${u.home}:${u.shell}`)
            .join('\n');
        this.fs.writeFile('/etc/passwd', content);
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