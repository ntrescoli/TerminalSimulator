import { ICommand } from '../../../../kernel/domain/entities/Command';

export const AddUser: ICommand = {
    name: 'adduser',
    // description: 'Añade un usuario al sistema o añade un usuario a un grupo',
    execute: async ({ args, userManager, env }) => {
        if (env.get('USER') !== 'root') return "adduser: Only root can do that";

        // Caso: adduser nombre_usuario nombre_grupo
        if (args.length === 2) {
            const [username, groupName] = args;
            const error = userManager.addUserToGroup(username, groupName);
            
            if (error) return error;
            return `Adding user '${username}' to group '${groupName}'... Done.`;
        }

        // Caso: adduser nombre_usuario (Comportamiento similar a useradd)
        if (args.length === 1) {
            // Aquí puedes llamar internamente a la lógica de creación de usuario
            // O simplemente decir que para crear uses 'useradd'
            return "Use 'useradd' to create new users or 'adduser user group' to link them.";
        }

        return "Usage: adduser USER GROUP";
    }
};