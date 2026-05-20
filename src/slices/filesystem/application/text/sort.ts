import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Sort: ICommand = {
    name: 'sort',

    execute: async ({ args, hasFlag, fs, pipeInput }) => {
        const filePath = args[0] ? args[0].trim() : '';
        let content = '';

        // 1. Obtener contenido
        if (pipeInput) {
            content = pipeInput;
        } else {
            if (!filePath) return 'sort: missing file operand';
            
            const node = fs.resolvePath(filePath);
            if (!node || node.type !== 'file') {
                return `sort: ${filePath}: No such file or directory`;
            }
            content = node.content || '';
        }

        // 2. Romper en líneas y limpiar la última si está vacía (comportamiento Unix)
        const lines = content.split('\n');
        if (lines.length > 1 && lines[lines.length - 1] === '') {
            lines.pop();
        }

        // 3. Ordenar alfabéticamente
        lines.sort((a, b) => a.localeCompare(b));

        // 4. Si tiene la flag -r, le damos la vuelta a la tortilla
        if (hasFlag('r')) {
            lines.reverse();
        }

        return lines.join('\n');
    },
};