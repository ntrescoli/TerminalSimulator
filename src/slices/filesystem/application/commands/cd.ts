import { ICommand } from '../../../../kernel/domain/entities/Command';
import { PathResolver } from '../services/PathResolver';

export const Cd: ICommand = {
    name: 'cd',
    execute: ({ args, fs, env }) => {
        const path = args[0] || '~';
        const result = fs.changeDirectory(path);
        // Si falló, exponemos el string de error formateado
        if (result.isFailure) return `cd: ${result.getError()}`; 

        if (path === '-') return PathResolver.getAbsolutePath(fs.getCurrentDirectory());

        env.set('PWD', PathResolver.getAbsolutePath(fs.getCurrentDirectory()));
        return "";
    }
};