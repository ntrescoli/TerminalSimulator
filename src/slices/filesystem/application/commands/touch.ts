import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Touch: ICommand = {
    name: 'touch',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "touch: missing file operand";

        const path = args[0];
        const content = args[1] || ""; // Mantenemos tu soporte para contenido opcional

        // 1. Llamamos al FileSystem (ahora devuelve Result<INode>)
        const result = fs.touch(path, content);

        // 2. Si success es false, devolvemos el string del error
        if (!result.success) {
            return result.error;
        }

        // 3. Si tuvo éxito, devolvemos string vacío (comportamiento Unix)
        return "";
    }
};