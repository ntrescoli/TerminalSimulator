import { ICommand } from '../../types/types';

export const Cat: ICommand = {
    name: 'cat',
    execute: ({ args, fs, hasFlag }) => {
        if (args.length < 1) return "";

        // 1. Obtenemos el objeto Result
        const result = fs.cat(args[0]);

        // 2. Si falló, devolvemos el error directamente
        if (!result.success) {
            return result.error;
        }

        // 3. Si tuvo éxito, trabajamos con result.data (el contenido)
        const content = result.data;

        // Lógica del flag -n (numerar líneas)
        if (hasFlag('-n')) {
            return content.split('\n')
                .map((line, i) => `${(i + 1).toString().padStart(6)}  ${line}`)
                .join('\n');
        }
        
        return content;
    }
};