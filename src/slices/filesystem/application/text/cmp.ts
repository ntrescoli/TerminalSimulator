import { ICommand } from '../../../../kernel/domain/entities/Command';
import { PathResolver } from '../../../filesystem/application/services/PathResolver';

export const Cmp: ICommand = {
    name: 'cmp',
    valuedFlags: [],

    execute: async ({ args, fs }) => {
        // 1. Validar que nos pasen los dos archivos a comparar
        if (args.length < 2) {
            return "cmp: usage: cmp file1 file2";
        }

        const path1 = args[0].trim();
        const path2 = args[1].trim();

        const rootNode = fs.getRoot();
        const currentDir = fs.getCurrentDirectory();

        // 2. Resolver y leer el primer archivo
        const node1 = PathResolver.resolve(path1, currentDir, rootNode);
        if (!node1 || node1.type !== 'file') {
            return `cmp: ${path1}: No such file or directory`;
        }

        // 3. Resolver y leer el segundo archivo
        const node2 = PathResolver.resolve(path2, currentDir, rootNode);
        if (!node2 || node2.type !== 'file') {
            return `cmp: ${path2}: No such file or directory`;
        }

        const content1 = node1.content || "";
        const content2 = node2.content || "";

        // Si son exactamente iguales, terminamos en silencio (Éxito en Linux)
        if (content1 === content2) {
            return "";
        }

        // 4. Buscar la primera diferencia carácter por carácter
        const minLength = Math.min(content1.length, content2.length);
        let currentLine = 1;
        let currentByte = 1; // En Linux el conteo de bytes empieza en 1

        for (let i = 0; i < minLength; i++) {
            const char1 = content1[i];
            const char2 = content2[i];

            if (char1 !== char2) {
                return `${path1} ${path2} differ: byte ${currentByte}, line ${currentLine}`;
            }

            // Si el carácter es un salto de línea, avanzamos la cuenta de líneas y reiniciamos el byte? No, en Linux el '\n' también cuenta como un byte de la línea actual.
            if (char1 === '\n') {
                currentLine++;
            }
            currentByte++;
        }

        // 5. Si salimos del bucle y no encontramos diferencias, significa que uno 
        // de los archivos es una subcadena exacta del otro pero más largo.
        if (content1.length > content2.length) {
            return `cmp: EOF on ${path2} after byte ${currentByte - 1}, line ${currentLine}`;
        } else {
            return `cmp: EOF on ${path1} after byte ${currentByte - 1}, line ${currentLine}`;
        }
    }
};