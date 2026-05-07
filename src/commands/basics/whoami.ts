import { ICommand } from '../../types/types';

export const Whoami: ICommand = {
    name: 'whoami',
    execute: ({ env }) => env.get('USER') || 'unknown'
};