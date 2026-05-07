import { ICommand } from '../../types/types';

export const Touch: ICommand = {
    name: 'touch',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "touch: missing file operand";

        const path = args[0];
        const content = args[1] || "";

        // Capturamos el error de permisos o de ruta
        const error = fs.touch(path, content);

        if (error) return error;
        return "";
    }
};