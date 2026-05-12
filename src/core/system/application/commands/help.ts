import { commandList } from '../../../kernel/application/commands/index';
import { ICommand } from '../../../kernel/domain/entities/Command';

export const Help: ICommand = {
    name: 'help',
    execute: ({ args }) => {
        return `Comandos disponibles: ${commandList.map(c => c.name).join(', ')}`;
    }
};