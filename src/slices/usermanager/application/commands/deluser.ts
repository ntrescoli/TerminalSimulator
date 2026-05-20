import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const DelUser: ICommand = {
    name: 'deluser',
    // description: 'Elimina un usuario del sistema',
    execute: async ({ args, userManager, env, fs: _fs }) => {
        if (env.get('USER') !== 'root') return 'deluser: Only root can do that';
        if (args.length === 0) return 'deluser: enter a username';

        const username = args[0];

        const effectiveUser = env.get('USER'); // Será 'root' si hay sudo
        const realUser = env.get('SUDO_USER') || effectiveUser; // Será 'nico' si hay sudo

        if (username === realUser) {
            return `deluser: The user '${username}' is currently logged in and cannot be deleted.`;
        }

        const error = userManager.deleteUser(username);

        if (error) return error;

        // Opcional: ¿Borrar la carpeta home? 
        // En Linux es 'deluser --remove-home'. Aquí lo haremos manual o automático.
        // fs.rmdir(`/home/${username}`); 

        return `Removing user '${username}'... Done.`;
    },
};