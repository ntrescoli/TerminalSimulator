import { ICommand } from '../../../../kernel/domain/entities/Command';

export const DelGroup: ICommand = {
    name: 'delgroup',
    // description: 'Elimina un grupo del sistema',
    execute: async ({ args, userManager, env }) => {
        if (env.get('USER') !== 'root') return "delgroup: Only root can do that";
        if (args.length === 0) return "delgroup: enter a group name";

        const groupName = args[0];
        const error = userManager.deleteGroup(groupName);

        if (error) return error;

        return `Removing group '${groupName}'... Done.`;
    }
};