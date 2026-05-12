import { ICommand } from '../../../kernel/domain/entities/Command';

export const Groups: ICommand = {
    name: 'groups',
    // description: 'Muestra los grupos a los que pertenece un usuario',
    execute: async ({ args, userManager, env }) => {
        const targetUser = args[0] || env.get('USER');
        const allGroups = userManager.getGroups();
        
        // Filtramos grupos donde el usuario es miembro o es su grupo principal
        const userGroups = allGroups
            .filter(g => g.groupName === targetUser || g.members.includes(targetUser))
            .map(g => g.groupName);

        if (userGroups.length === 0) return `${targetUser} : no groups found`;
        
        return `${targetUser} : ${userGroups.join(' ')}`;
    }
};