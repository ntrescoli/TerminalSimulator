import { Group } from '@/slices/usermanager/domain/entities/Group';
import { User } from '@/slices/usermanager/domain/entities/User';
import { FileSystem } from '../../../slices/filesystem/application/services/FileSystem';
import { NodeFactory } from '@/slices/filesystem/application/services/NodeFactory';
import { UserManagerRepositoryImpl } from '@/slices/usermanager/infrastructure/persistence/UserManagerRepositoryImpl';
import { Environment } from '@/slices/system/domain/entities/Environment';

export class DefaultsRepositoryImpl {
    constructor(
        private env: Environment,
        private fs: FileSystem, 
        private repository: UserManagerRepositoryImpl
    ) { }

    public loadDefaults() {

        // Environment
        this.env.set = {
            USER: 'root',
            HOSTNAME: 'ubuntu-server',
            HOME: '/root',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            SHELL: '/bin/bash',
            PWD: '/',
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8',
            SUDO_USER: ''
        };

        // FileSystem
        this.fs.root = NodeFactory.create('/', 'dir', 'root');
        this.fs.currentDirectory = this.fs.root;

        this.fs.mkdir("home");
        this.fs.mkdir("bin");
        this.fs.mkdir("etc");
        this.fs.mkdir("var");
        this.fs.writeFile("/etc/passwd", "root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000:guest:/home/guest:/bin/bash");
        this.fs.writeFile("/etc/group", "root:x:0:\nsudo:x:27:guest,nico\n");
        this.fs.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");

        // Users and Groups
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
    }

}