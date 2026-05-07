import { ICommand } from '../../types/types';

export const Clear: ICommand = {
    name: 'clear',
    execute: () => 'COMMAND_CLEAR'
};