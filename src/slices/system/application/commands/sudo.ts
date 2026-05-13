import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Sudo: ICommand = {
    name: 'sudo',
    execute: async ({ args, kernel, env, userManager }) => {
        if (args.length === 0) return "usage: sudo <command> [arguments]";

        const currentUser = env.get('USER') || 'guest';

        // 1. Verificación de privilegios de sudoer
        const groups = userManager.getGroups();
        const sudoGroup = groups.find(g => g.groupName === 'sudo' || g.groupName === 'wheel');
        
        const isSudoer = sudoGroup?.members.includes(currentUser);

        // Si no es root y no está en el grupo sudo, denegamos
        if (currentUser !== 'root' && !isSudoer) {
            // Nota: En un sistema real aquí pediríamos password, 
            // de momento simulamos el mensaje de error clásico de Unix.
            return `[sudo] password for ${currentUser}: \nSorry, user ${currentUser} is not allowed to execute sudo. This incident will be reported.`;
        }

        // 2. Preparar el comando a ejecutar
        const commandLineToExecute = args.join(' ');

        // 3. Elevación temporal de privilegios
        const originalUser = currentUser;
        
        try {
            // Cambiamos el entorno a root. 
            // Como FileSystem consulta env.get('USER'), ahora tendrá acceso total.
            env.set('USER', 'root');
            
            // Registramos quién disparó el comando para auditoría o comandos sensibles
            env.set('SUDO_USER', originalUser); 
            
            // Ejecutamos a través del kernel. 
            // El flag 'true' suele indicar que es una ejecución interna/subproceso.
            return await kernel.execute(commandLineToExecute, true); 
            
        } catch (error: any) {
            return `sudo: error executing command: ${error.message}`;
        } finally {
            // --- RESTAURACIÓN CRÍTICA ---
            // Usamos finally para garantizar que, pase lo que pase, 
            // el usuario no se quede como root permanentemente.
            env.set('USER', originalUser);
            
            // Limpiamos el rastro
            if (env.has && env.has('SUDO_USER')) {
                // Si tu Environment tiene delete, úsalo. Si no, string vacío.
                env.set('SUDO_USER', ''); 
            } else {
                env.set('SUDO_USER', '');
            }
        }
    }
};