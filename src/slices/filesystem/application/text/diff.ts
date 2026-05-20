import type { ICommand } from '../../../../kernel/domain/entities/Command';
import { PathResolver } from '../../../filesystem/application/services/PathResolver';

// No funciona exactamente como el diff de Linux, pero se acerca bastante. El formato de salida es similar al formato "unificado" de diff, pero con algunas diferencias para simplificar la implementación. En particular, no se muestran líneas sin cambios entre las líneas modificadas, y se muestra el número de línea original en ambos archivos para cada cambio.
export const Diff: ICommand = {
    name: 'diff',
    valuedFlags: [],

    execute: async ({ args, fs }) => {
        // 1. Validar argumentos
        if (args.length < 2) {
            return 'diff: usage: diff file1 file2';
        }

        const path1 = args[0].trim();
        const path2 = args[1].trim();

        const rootNode = fs.getRoot();
        const currentDir = fs.getCurrentDirectory();

        // 2. Resolver archivos
        const node1 = PathResolver.resolve(path1, currentDir, rootNode);
        if (!node1 || node1.type !== 'file') {
            return `diff: ${path1}: No such file or directory`;
        }

        const node2 = PathResolver.resolve(path2, currentDir, rootNode);
        if (!node2 || node2.type !== 'file') {
            return `diff: ${path2}: No such file or directory`;
        }

        // 3. Separar por líneas (eliminando el último salto de línea vacío si existe)
        const lines1 = (node1.content || '').split('\n');
        const lines2 = (node2.content || '').split('\n');

        // Si son idénticos, terminamos en silencio
        if (node1.content === node2.content) {
            return '';
        }

        const output: string[] = [];
        const maxLines = Math.max(lines1.length, lines2.length);

        let i = 0;
        while (i < maxLines) {
            const l1 = lines1[i];
            const l2 = lines2[i];

            // Caso A: La línea existe en ambos pero es diferente (Modificación)
            if (l1 !== undefined && l2 !== undefined && l1 !== l2) {
                output.push(`${i + 1}c${i + 1}`); // Formato clásico: LíneaX c LíneaY (change)
                output.push(`< ${l1}`);
                output.push('---');
                output.push(`> ${l2}`);
            } 
            // Caso B: El archivo 1 es más largo (Líneas borradas en el archivo 2)
            else if (l1 !== undefined && l2 === undefined) {
                output.push(`${i + 1}d${lines2.length}`); // d (delete)
                output.push(`< ${l1}`);
            } 
            // Caso C: El archivo 2 es más largo (Líneas añadidas en el archivo 2)
            else if (l1 === undefined && l2 !== undefined) {
                output.push(`${lines1.length}a${i + 1}`); // a (append / add)
                output.push(`> ${l2}`);
            }

            i++;
        }

        return output.join('\n');
    },
};