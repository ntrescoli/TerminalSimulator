"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uniq = void 0;
exports.Uniq = {
    name: 'uniq',
    execute: async ({ args, hasFlag, fs, pipeInput }) => {
        let filePath = args[0] ? args[0].trim() : "";
        let content = "";
        // 1. Obtener contenido
        if (pipeInput) {
            content = pipeInput;
        }
        else {
            if (!filePath)
                return "uniq: missing file operand";
            const node = fs.resolvePath(filePath);
            if (!node || node.type !== 'file') {
                return `uniq: ${filePath}: No such file or directory`;
            }
            content = node.content || "";
        }
        let lines = content.split('\n');
        if (lines.length > 1 && lines[lines.length - 1] === "") {
            lines.pop();
        }
        if (lines.length === 0)
            return "";
        // 2. Lógica de filtrado de consecutivos estilo Linux
        const showCount = hasFlag('c');
        const result = [];
        let currentLine = lines[0];
        let count = 1;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i] === currentLine) {
                count++;
            }
            else {
                // Guardamos la línea anterior procesada
                if (showCount) {
                    result.push(`  ${count} ${currentLine}`);
                }
                else {
                    result.push(currentLine);
                }
                // Reseteamos para la nueva línea
                currentLine = lines[i];
                count = 1;
            }
        }
        // No olvidar meter la última línea del bucle
        if (showCount) {
            result.push(`  ${count} ${currentLine}`);
        }
        else {
            result.push(currentLine);
        }
        return result.join('\n');
    }
};
