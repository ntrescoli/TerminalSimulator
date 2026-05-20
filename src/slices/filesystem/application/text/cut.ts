import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Cut: ICommand = {
    name: 'cut',
    valuedFlags: ['d', 'f'], // Registramos 'd' (delimiter) y 'f' (fields)

    execute: async ({ args, flagValues, fs, pipeInput }) => {
        // 1. Extraer configuraciones de las flags
        let delimiter = '\t'; // Por defecto en Linux, cut usa tabulador
        if (flagValues && flagValues['-d']) {
            delimiter = flagValues['-d'];
        }

        let fieldNum = 1; // Por defecto el primer campo
        if (flagValues && flagValues['-f']) {
            const parsedField = parseInt(flagValues['-f']);
            if (!isNaN(parsedField) && parsedField > 0) {
                fieldNum = parsedField;
            } else {
                return 'cut: fields are numbered from 1';
            }
        }

        // 2. Obtener el contenido (Prioriza tuberías)
        const filePath = args[0] ? args[0].trim() : '';
        let content = '';

        if (pipeInput) {
            content = pipeInput;
        } else {
            if (!filePath) return 'cut: missing file operand';
            
            const node = fs.resolvePath(filePath);
            if (!node || node.type !== 'file') {
                return `cut: ${filePath}: No such file or directory`;
            }
            content = node.content || '';
        }

        // 3. Procesar el texto línea a línea
        const lines = content.split('\n');
        const processedLines = lines.map(line => {
            if (line === '') return '';
            
            // Si la línea no contiene el delimitador, Linux cut devuelve la línea entera
            if (!line.includes(delimiter)) return line;

            const parts = line.split(delimiter);
            // Recordar que -f1 es el índice 0 de la matriz
            return parts[fieldNum - 1] !== undefined ? parts[fieldNum - 1] : '';
        });

        return processedLines.join('\n');
    },
};