import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Help: ICommand = {
    name: 'help',
    execute: async ({ args }) => {
        const { commandList } = await import('../../../../kernel/application/commands/index');
        return `Comandos disponibles: ${commandList.map((c: any) => c.name).join(', ')}`;
    }
};