import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Grep: ICommand = {
    name: 'grep',
    execute: ({ args, hasFlag, fs, pipeInput }) => {
        const pattern = args[0];
        const filePath = args[1];

        if (!pattern) return 'usage: grep [pattern] [file]';

        let content = '';

        // 1. Resolvemos el origen del contenido: Entrada entubada (pipe) o archivo físico
        if (pipeInput) {
            content = pipeInput;
        } else if (filePath) {
            const result = fs.cat(filePath);

            // Si la lectura falló (no existe, es directorio, etc.), devolvemos el error formateado
            if (result.isFailure) {
                return `grep: ${result.getError()}`;
            }

            // Si tuvo éxito, extraemos el string plano de forma segura
            content = result.getValue();
        } else {
            return 'grep: missing input';
        }

        // 2. Procesamiento de banderas (Flags) de Grep
        const caseInsensitive = hasFlag('-i');
        const invertMatch = hasFlag('-v'); 
        const countMode = hasFlag('-c');   

        // Creamos la expresión regular de forma segura
        let regex: RegExp;
        try {
            regex = new RegExp(pattern, caseInsensitive ? 'i' : '');
        } catch {
            return `grep: invalid regular expression: ${pattern}`;
        }
        
        // 3. Filtrado de líneas
        const lines = content.split('\n').filter(line => {
            const matches = regex.test(line);
            return invertMatch ? !matches : matches;
        });

        // 4. Formateo de salida
        if (countMode) return lines.length.toString();
        
        return lines.join('\n');
    },
};