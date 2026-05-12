import { ICommand } from '../../../kernel/domain/entities/Command';

export const UserAdd: ICommand = {
    name: 'useradd',
    // description: 'Crea un nuevo usuario y su grupo privado',
    // Definimos qué letras esperan un valor después de ellas
    valuedFlags: ['u', 's'],
    execute: async ({ args, flagValues, userManager, fs, env }) => {
        // 1. Validaciones de privilegios
        if (env.get('USER') !== 'root') {
            return "useradd: Only root can do that";
        }

        if (args.length < 1) {
            return "useradd: missing username";
        }

        const username = args[0];

        // 2. Lógica de ID: 
        // Si viene la flag -u, la usamos. Si no, calculamos el siguiente disponible.
        const customUid = flagValues['-u'] ? parseInt(flagValues['-u']) : null;

        // Calculamos el ID basado en el máximo actual para evitar colisiones
        const allUsers = userManager.getUsers();
        const nextId = customUid || (allUsers.length > 0
            ? Math.max(...allUsers.map(u => u.uid)) + 1
            : 1000);

        // 3. Creación del objeto usuario (Ubuntu Style: GID = UID)
        const newUser: User = {
            username,
            uid: nextId,
            gid: nextId,
            home: `/home/${username}`,
            shell: flagValues['-s'] || '/bin/bash',
            fullName: username
        };

        // 4. Intentamos guardar mediante el manager
        // El manager ahora se encarga de crear el grupo privado y los archivos /etc/passwd y /etc/group
        const error = userManager.saveUser(newUser);
        if (error) return error;

        // 5. Creamos su espacio físico en el disco virtual
        fs.mkdir(newUser.home);

        const shellInfo = flagValues['-s'] ? ` with shell ${newUser.shell}` : "";
        return `User ${username} created (UID: ${nextId})${shellInfo}`;
    }
};