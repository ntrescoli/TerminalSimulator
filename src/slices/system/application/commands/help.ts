import type { ICommand } from '../../../../kernel/domain/entities/Command';
import { commandList } from '../../../../kernel/application/commands/index';

export const Help: ICommand = {
    name: 'help',
    execute: async ({ args: _args }) => {
        return `Comandos disponibles: ${commandList.map((c: any) => c.name).join(', ')}`;
    },
};