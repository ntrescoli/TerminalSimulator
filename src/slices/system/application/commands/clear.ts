import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Clear: ICommand = {
    name: 'clear',
    execute: () => 'COMMAND_CLEAR',
};