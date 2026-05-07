import { ICommand } from '../../types/types';

export const Env: ICommand = {
    name: 'env',
    execute: ({ env }) => {
        const allVars = env.getAll();
        return Object.entries(allVars)
            .map(([key, val]) => `${key}=${val}`)
            .join('\n');
    }
};