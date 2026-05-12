import { ICommand } from '../../../kernel/domain/entities/Command';

export const Whoami: ICommand = {
    name: 'whoami',
    execute: ({ env }) => env.get('USER') || 'unknown'
};