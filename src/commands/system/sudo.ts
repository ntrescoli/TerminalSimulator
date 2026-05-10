import { ICommand } from '../../types/types';

export const Sudo: ICommand = {
    name: 'sudo',
    execute: async ({ args, kernel, env, userManager }) => {
        if (args.length === 0) return "usage: sudo <command> [arguments]";

        const currentUser = env.get('USER');

        // 1. Verificación de permisos
        const groups = userManager.getGroups();
        const sudoGroup = groups.find(g => g.groupName === 'sudo');
        
        const isSudoer = sudoGroup?.members.includes(currentUser);

        if (currentUser !== 'root' && !isSudoer) {
            return `[sudo] password for ${currentUser}: \nSorry, user ${currentUser} is not allowed to execute sudo. This incident will be reported.`;
        }

        // 2. Reconstruir el comando
        const commandLineToExecute = args.join(' ');

        // 3. Elevación temporal
        const originalUser = env.get('USER');
        
        try {
            // Establecemos el usuario efectivo como root
            env.set('USER', 'root');
            
            // Guardamos quién es el usuario real que está ejecutando el sudo
            // Esto permitirá a 'deluser' saber quién eres realmente aunque seas root ahora
            env.set('SUDO_USER', originalUser); 
            
            return await kernel.execute(commandLineToExecute, true); 
            
        } finally {
            // Siempre restauramos el estado original del entorno
            env.set('USER', originalUser);
            
            // Eliminamos la variable de rastro para que no se quede "pegada"
            // Suponiendo que tu Environment tiene un método delete o similar, 
            // si no, env.set('SUDO_USER', '') servirá.
            env.set('SUDO_USER', ''); 
        }
    }
};