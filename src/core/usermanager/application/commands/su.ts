import { ICommand } from '../../../kernel/domain/entities/Command';

export const Su: ICommand = {
    name: 'su',
    execute: ({ args, env, userManager }) => { // <--- Pasamos el manager
        const targetName = args[0] || 'root';
        const user = userManager.getUserByName(targetName);

        if (!user) return `su: user '${targetName}' does not exist`;

        env.set('USER', user.username);
        env.set('HOME', user.home);
        // Podrías incluso cambiar el prompt basado en el shell del usuario
        
        return `Cambiando al usuario ${user.username}...`;
    }
};