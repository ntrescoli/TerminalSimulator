import { ICommand } from '../../types/types';

export const Grep: ICommand = {
    name: 'grep',
    execute: ({ args, hasFlag, fs, pipeInput }) => {
        const pattern = args[0];
        const filePath = args[1];

        if (!pattern) return "usage: grep [pattern] [file]";

        // Obtener contenido
        let content = pipeInput || (filePath ? fs.cat(filePath) : null);
        
        if (content === null) return "grep: missing input";
        if (content.startsWith('cat:')) return content; // Error de fs.cat

        // Flags de Grep real
        const caseInsensitive = hasFlag('-i');
        const invertMatch = hasFlag('-v'); // ¡Nueva flag fácil de añadir!
        const countMode = hasFlag('-c');   // ¡Otra flag común!

        const regex = new RegExp(pattern, caseInsensitive ? 'i' : '');
        
        const lines = content.split('\n').filter(line => {
            const matches = regex.test(line);
            return invertMatch ? !matches : matches;
        });

        if (countMode) return lines.length.toString();
        
        return lines.join('\n');
    }
};