import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Pwd: ICommand = {
    name: 'pwd',
    execute: ({ fs }) => fs.getPresentWorkingDirectory()
};