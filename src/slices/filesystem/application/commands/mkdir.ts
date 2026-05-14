import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Mkdir: ICommand = {
    name: 'mkdir',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "mkdir: missing operand";
        // 1. Ejecutamos y capturamos el objeto Result
        const result = fs.mkdir(args[0]);
        // 2. Comprobamos la propiedad success del patrón Result
        if (!result.success) {
            return result.error;
        }
        // 3. Si tuvo éxito, devolvemos string vacío (comportamiento estándar de Unix)
        return "";
    }
};