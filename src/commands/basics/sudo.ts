import { ICommand } from '../../types/types';

export const Sudo: ICommand = {
    name: 'sudo',
    execute: async ({ args, kernel, env, userManager }) => {
        if (args.length === 0) return "usage: sudo <command> [arguments]";

        const currentUser = env.get('USER');

        // 1. Verificación de permisos
        const groups = userManager.getGroups();
        const sudoGroup = groups.find(g => g.groupName === 'sudo');
        
        // Si eres root, entras directo. 
        // Si no, verificamos si estás en el grupo 'sudo'
        const isSudoer = sudoGroup?.members.includes(currentUser);

        if (currentUser !== 'root' && !isSudoer) {
            return `[sudo] password for ${currentUser}: \nSorry, user ${currentUser} is not allowed to execute sudo. This incident will be reported.`;
        }

        // 2. Reconstruir el comando (quitando la palabra 'sudo')
        const commandLineToExecute = args.join(' ');

        // 3. Elevación temporal
        const originalUser = env.get('USER');
        try {
            env.set('USER', 'root');
            
            // IMPORTANTE: Aquí usamos .execute, no .run
            // El segundo parámetro 'true' evita que se duplique en el historial
            return await kernel.execute(commandLineToExecute, true); 
            
        } finally {
            // Siempre restauramos el usuario
            env.set('USER', originalUser);
        }
    }
};