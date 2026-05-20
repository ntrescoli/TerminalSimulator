"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wc = void 0;
exports.Wc = {
    name: 'wc',
    // No añadimos valuedFlags porque -l, -w y -c son booleanas, no esperan un parámetro.
    execute: async ({ args, hasFlag, fs, pipeInput }) => {
        let filePath = args[0] ? args[0].trim() : "";
        // 1. Obtener el contenido (priorizando tuberías)
        let content = "";
        if (pipeInput) {
            content = pipeInput;
        }
        else {
            if (!filePath)
                return "wc: missing file operand";
            const node = fs.resolvePath(filePath);
            if (!node || node.type !== 'file') {
                return `wc: ${filePath}: No such file or directory`;
            }
            content = node.content || "";
        }
        // 2. Calcular las métricas
        // Líneas: contamos los saltos de línea (si el archivo está vacío, son 0)
        const lineCount = content === "" ? 0 : content.split('\n').length;
        // Palabras: filtramos espacios, tabuladores y saltos de línea
        const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
        // Bytes/Caracteres
        const byteCount = content.length;
        // 3. Comprobar qué flags se han activado usando el 'hasFlag' nativo de tu Kernel
        const showLines = hasFlag('l');
        const showWords = hasFlag('w');
        const showBytes = hasFlag('c') || hasFlag('m');
        // Si no se pasa ninguna flag, Linux por defecto muestra las tres métricas
        const noFlags = !showLines && !showWords && !showBytes;
        // 4. Formatear la salida
        let outputParts = [];
        if (showLines || noFlags)
            outputParts.push(lineCount.toString());
        if (showWords || noFlags)
            outputParts.push(wordCount.toString());
        if (showBytes || noFlags)
            outputParts.push(byteCount.toString());
        // Al final, si no viene de un pipe, se suele añadir el nombre del archivo
        if (!pipeInput && filePath) {
            outputParts.push(filePath);
        }
        return outputParts.join('\t');
    }
};
