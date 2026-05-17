import { ICommand } from '../../../../kernel/domain/entities/Command';

export const File: ICommand = {
    name: 'file',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "file: missing file operand";

        const path = args[0];

        // 1. Llamamos al FileSystem (ahora devuelve Result<INode>)
        const node = fs.resolvePath(path);
        if (!node) return `file: ${path}: No such file or directory`;

        const result = fs.getType(node);

        // 2. Si success es false, devolvemos el string del error       
        if (result.isFailure) return `file: ${result.getError()}`; 

        // 3. Si tuvo éxito, devolvemos string vacío (comportamiento Unix)
        return result.getValue() === 'dir' ? `${path}: directory` : `${path}: regular file`;
    }
};