import { ICommand } from '../../types/types';

export const Mkdir: ICommand = {
    name: 'mkdir',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "mkdir: missing operand";

        // Capturamos lo que devuelve el FileSystem
        const error = fs.mkdir(args[0]);

        // Si hay un error (es un string), lo devolvemos a la terminal
        if (error) return error;

        // Si es null, devolvemos string vacío (todo ok)
        return "";
    }
};