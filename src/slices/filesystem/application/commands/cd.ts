import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Cd: ICommand = {
    name: 'cd',
    execute: ({ args, fs, env }) => {
        const path = args[0] || '~';
        const error = fs.changeDirectory(path);

        if (error) return error; // "cd: no such directory", etc.

        env.set('PWD', fs.getPresentWorkingDirectory());
        return "";
    }
};