import { ICommand } from '../../types/types';

export const Chmod: ICommand = {
    name: 'chmod',
    execute: ({ options, args, hasFlag }) => {
        if (args.length < 1) return "usage: chmod [-rwx] file";

        const permissions = {
            read: hasFlag('-r'),
            write: hasFlag('-w'),
            execute: hasFlag('-x')
        };

        // Ahora chmod -rwx nota.txt activará las tres flags
        // porque el parser las separó en ['-r', '-w', '-x']
        return `Permisos actualizados a: ${JSON.stringify(permissions)}`;
    }
};