import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Finger: ICommand = {
    name: 'finger',

    execute: async ({ args, fs }) => {
        // Para que este comando sea 100% independiente y no rompa nada si tu UserManager
        // no expone getters de arrays, vamos a leer directamente de tu FileSystem el archivo '/etc/passwd'
        // que es donde tu UserManagerRepositoryImpl guarda la persistencia real del sistema.
        
        const passwdNode = fs.resolvePath('/etc/passwd');
        if (!passwdNode || passwdNode.type !== 'file') {
            return "finger: cannot read system user database";
        }

        const content = passwdNode.content || "";
        const lines = content.split('\n').filter(l => l.trim() !== "");

        // CASO A: Ficha detallada de un usuario específico -> finger root
        if (args.length > 0) {
            const target = args[0].trim().toLowerCase();
            const userLine = lines.find(line => line.startsWith(`${target}:`));

            if (!userLine) return `finger: ${target}: no such user`;

            // Estructura clásica /etc/passwd -> user:password:uid:gid:gecos(nombre_real):home:shell
            const parts = userLine.split(':');
            const username = parts[0];
            const uid = parts[2];
            const realName = parts[4] || username;
            const homeDir = parts[5];
            const shell = parts[6];

            return [
                `Login: ${username}\t\t\t\tName: ${realName}`,
                `Directory: ${homeDir}\t\t\tShell: ${shell}`,
                `UID: ${uid}\t\t\t\tStatus: Active`,
                `Project: No profile project file specified.`
            ].join('\n');
        }

        // CASO B: Listado general abreviado de todos los usuarios del sistema -> finger
        let output = ["Login\t\tName\t\tTTY\tIdle\tLogin Time"];
        
        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 6) {
                const login = parts[0];
                const name = parts[4] || parts[0];
                // Rellenamos con datos simulados de terminal para simular Linux real
                output.push(`${login.padEnd(12)}${name.padEnd(16)}pts/0\t*\tMay 17 20:26`);
            }
        });

        return output.join('\n');
    }
};