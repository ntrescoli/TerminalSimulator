import type { ICommand } from '../../../domain/entities/Command';

export const Easteregg: ICommand = {
    name: 'easteregg',
    execute: () => { 
        return 'Esto es un Easter Egg.';
    },
};