import { ICommand } from '../../../../kernel/domain/entities/Command';

export const UserAdd: ICommand = {
    name: 'useradd',
    // Definimos qué letras esperan un valor (el Kernel las mapeará a flagValues)
    valuedFlags: ['u', 's'],
    
    execute: async ({ args, flagValues, userManager, fs, env }) => {
        // 1. Validaciones de privilegios (Solo root puede añadir usuarios)
        if (env.get('USER') !== 'root') {
            return "useradd: Only root can do that";
        }

        if (args.length < 1) {
            return "useradd: missing username";
        }

        const username = args[0];

        // 2. Gestión de IDs
        // Comprobamos si el usuario ya existe antes de calcular IDs
        const allUsers = userManager.getUsers();
        if (allUsers.some(u => u.username === username)) {
            return `useradd: user '${username}' already exists`;
        }

        // Si viene la flag -u, la usamos. Si no, calculamos el siguiente > 1000.
        let nextId: number;
        if (flagValues['-u']) {
            nextId = parseInt(flagValues['-u']);
            if (isNaN(nextId)) return "useradd: invalid numeric argument for -u";
            
            if (allUsers.some(u => u.uid === nextId)) {
                return `useradd: UID ${nextId} already exists`;
            }
        } else {
            nextId = allUsers.length > 0
                ? Math.max(...allUsers.map(u => u.uid)) + 1
                : 1000;
        }

        // 3. Preparación del objeto Usuario
        // En sistemas modernos, useradd crea un grupo con el mismo nombre y GID que el UID
        const newUser = {
            username,
            uid: nextId,
            gid: nextId, // User Private Group (UPG)
            home: `/home/${username}`,
            shell: flagValues['-s'] || '/bin/bash',
            fullName: username
        };

        // 4. Delegación al Servicio (Capa de Aplicación)
        // El servicio se encargará de:
        // - Crear el grupo en /etc/group (vía saveGroup)
        // - Crear el usuario en /etc/passwd (vía saveUser)
        // - Sincronizar el repositorio
        const error = userManager.saveUser(newUser);
        if (error) return error;

        // 5. Efectos secundarios en el FileSystem
        // Creamos el home directory si no existe
        // if (!fs.exists(newUser.home)) {
        //     fs.mkdir(newUser.home);
        //     // Opcional: Podrías copiar archivos de un "skel" aquí
        // }

        const shellInfo = flagValues['-s'] ? ` with shell ${newUser.shell}` : "";
        return `useradd: user '${username}' added (UID: ${nextId})${shellInfo}`;
    }
};