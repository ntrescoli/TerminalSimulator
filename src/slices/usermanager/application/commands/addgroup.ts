import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const AddGroup: ICommand = {
    name: 'addgroup',
    // description: 'Añade un nuevo grupo al sistema',
    valuedFlags: ['g'], // -g para especificar un GID manual si se desea
    execute: async ({ args, flagValues, userManager, env }) => {
        // 1. Validación de privilegios (Solo root puede crear grupos)
        if (env.get('USER') !== 'root') {
            return 'addgroup: Only root can do that';
        }

        // 2. Validación de argumentos
        if (args.length < 1) {
            return 'addgroup: Se requiere un nombre de grupo.\nUso: addgroup [OPCIONES] NOMBRE';
        }

        const groupName = args[0];

        // 3. Lógica de GID (Manual con -g o automático)
        let gid: number;
        if (flagValues['-g']) {
            gid = parseInt(flagValues['-g']);
            if (isNaN(gid)) return 'addgroup: el GID debe ser un número';
        } else {
            // Calculamos el siguiente GID disponible
            const allGroups = userManager.getGroups();
            gid = allGroups.length > 0 
                ? Math.max(...allGroups.map(g => g.gid)) + 1 
                : 1000;
        }

        // 4. Llamada al UserManager para persistir el grupo
        // Asegúrate de que tu userManager tenga este método
        const error = userManager.saveGroup({
            groupName,
            gid,
            members: [], // Nuevo grupo nace sin miembros
        });

        if (error) return error;

        return `Añadiendo el grupo '${groupName}' (GID ${gid})... Hecho.`;
    },
};