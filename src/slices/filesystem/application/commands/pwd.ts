import { ICommand } from '../../../../kernel/domain/entities/Command';
import { PathResolver } from '../services/PathResolver';

export const Pwd: ICommand = {
    name: 'pwd',
    execute: ({ fs }) => PathResolver.getAbsolutePath(fs.getCurrentDirectory())
};