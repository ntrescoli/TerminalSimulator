import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Passwd: ICommand = {
    name: 'passwd',

    execute: async ({ args, userManager, env, fs }) => {
        const currentUser = env.get('USER') || 'guest';
        
        // 1. Determinar el usuario objetivo (por defecto, uno mismo)
        let targetUser = args[0] ? args[0].trim() : currentUser;

        if (targetUser === 'guest') {
            return "passwd: You cannot change the password for 'guest'";
        }

        // 2. Control de permisos al estilo Linux
        if (currentUser !== 'root' && currentUser !== targetUser) {
            return 'passwd: Permission denied (You are not root)';
        }

        // 3. Capturar la contraseña de los argumentos
        let newPassword = args[1] ? args[1].trim() : '';
        
        if (!newPassword && args[0] && targetUser === currentUser) {
            newPassword = args[0].trim();
            targetUser = currentUser;
        }

        if (!newPassword || newPassword === targetUser) {
            return 'Usage: passwd [username] [new_password]\n(Note: password cannot be empty)';
        }

        // 4. Verificar que el usuario existe en /etc/passwd
        const passwdNode = fs.resolvePath('/etc/passwd');
        if (!passwdNode || passwdNode.type !== 'file') {
            return 'passwd: User database (/etc/passwd) not found';
        }

        const passwdContent = passwdNode.content || '';
        const userExists = passwdContent.split('\n').some(line => line.startsWith(`${targetUser}:`));

        if (!userExists) {
            return `passwd: user '${targetUser}' does not exist`;
        }

        // 🌟 5. LLAMADA DE DOMINIO: Dejamos que el servicio haga la magia
        // Esto hashea la clave, actualiza el archivo en el sistema de archivos virtual,
        // guarda en el repositorio y refresca las cachés internas instantáneamente.
        const error = userManager.updatePassword(targetUser, newPassword);
        
        if (error) {
            return error;
        }

        return `passwd: password updated successfully for user '${targetUser}'`;
    },
};