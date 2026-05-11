import { ICommand } from '../../types/types';
import { commandList } from '../index';

export const Help: ICommand = {
    name: 'help',
    execute: ({ args }) => {
        return `Comandos disponibles: ${commandList.map(c => c.name).join(', ')}`;
    }
};