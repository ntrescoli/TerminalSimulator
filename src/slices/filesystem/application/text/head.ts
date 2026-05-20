import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Head: ICommand = {
    name: 'head',
    valuedFlags: ['n'],

    execute: async ({ args, flagValues, fs, pipeInput }) => {
        let maxLines = 10;

        // Si el Kernel parseó la flag '-n', extraemos su valor con seguridad
        if (flagValues && flagValues['-n']) {
            const val = parseInt(flagValues['-n']);
            if (!isNaN(val) && val > 0) maxLines = val;
        }

        // Gracias al Kernel, args[0] SIEMPRE será la ruta del archivo limpia de flags
        const filePath = args[0] ? args[0].trim() : '';

        let content = '';
        if (pipeInput) {
            content = pipeInput;
        } else {
            if (!filePath) return 'head: missing file operand';
            
            const node = fs.resolvePath(filePath);
            if (!node || node.type !== 'file') {
                return `head: cannot open '${filePath}' for reading: No such file or directory`;
            }
            content = node.content || '';
        }

        const lines = content.split('\n');
        return lines.slice(0, maxLines).join('\n');
    },
};