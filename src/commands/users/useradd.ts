import { ICommand, User } from '../../types/types';

export const UserAdd: ICommand = {
    name: 'useradd',
    // Definimos qué letras esperan un valor después de ellas
    valuedFlags: ['u', 's'], 
    execute: ({ args, flagValues, userManager, fs, env }) => {
        // 1. Validaciones básicas (Manteniendo tu estilo)
        if (env.get('USER') !== 'root') return "useradd: Only root can do that";
        if (args.length < 1) return "useradd: missing username";

        const username = args[0];

        // 2. Lógica de UID: 
        // Si viene la flag -u, la usamos. Si no, usamos tu cálculo de nextUid.
        const customUid = flagValues['-u'] ? parseInt(flagValues['-u']) : null;
        const nextUid = customUid || (userManager.getUsers().length + 1000);

        // 3. Creación del objeto usuario
        const newUser: User = {
            username,
            uid: nextUid,
            gid: nextUid,
            home: `/home/${username}`,
            // Si viene la flag -s (shell), la usamos, si no, '/bin/bash'
            shell: flagValues['-s'] || '/bin/bash',
            fullName: username
        };

        // 4. Intentamos guardar en /etc/passwd mediante el manager
        const error = userManager.saveUser(newUser);
        if (error) return error;

        // 5. Creamos su espacio físico
        fs.mkdir(newUser.home);
        
        // Retorno detallado incluyendo la shell si fue personalizada
        const shellInfo = flagValues['-s'] ? ` with shell ${newUser.shell}` : "";
        return `User ${username} created (UID: ${nextUid})${shellInfo}`;
    }
};