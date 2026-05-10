import { ICommand } from '../../types/types';

export const Echo: ICommand = {
    name: 'echo',
    execute: ({ args, env }) => {
        return args.map(arg => {
            if (arg.startsWith('$')) {
                const varName = arg.substring(1);
                return env.get(varName) || '';
            }
            return arg;
        }).join(' ');
    }
};