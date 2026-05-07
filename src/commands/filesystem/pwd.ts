import { ICommand } from '../../types/types';

export const Pwd: ICommand = {
    name: 'pwd',
    execute: ({ fs }) => fs.getPresentWorkingDirectory()
};