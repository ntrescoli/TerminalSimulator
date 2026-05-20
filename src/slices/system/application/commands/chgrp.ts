import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Chgrp: ICommand = {
    name: 'chgrp',
    execute: async ({ args, fs, env, userManager }) => {
        // 1. Validar argumentos mínimos requeridos
        if (args.length < 2) {
            return 'usage: chgrp GROUP FILE...';
        }

        const targetGroup = args[0];
        const targetPath = args[1];
        const currentUser = env.get('USER') || 'guest';

        // 2. Validar la existencia del grupo en el sistema de usuarios
        const groupObject = userManager.getGroups().find(g => g.groupName === targetGroup);
        if (!groupObject) {
            return `chgrp: invalid group: '${targetGroup}'`;
        }

        // 3. Ejecutar la acción en el FileSystem pasando los miembros del grupo
        const result = fs.setOwnership(
            targetPath, 
            currentUser, 
            groupObject.members, 
            undefined, // No alteramos el dueño (owner)
            targetGroup, // Cambiamos el grupo
        );

        // 4. Si el FileSystem deniega la operación o no encuentra el archivo, formateamos con el prefijo 'chgrp:'
        if (result.isFailure) {
            return `chgrp: ${result.getError()}`;
        }

        return ''; // Éxito silencioso (Estilo Unix estándar)
    },
};