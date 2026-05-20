"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cat = void 0;
exports.Cat = {
    name: 'cat',
    execute: ({ args, fs, hasFlag }) => {
        if (args.length < 1)
            return "cat: missing file operand";
        const outputs = [];
        // Iteramos sobre todos los archivos pasados como argumentos
        for (const filePath of args) {
            const result = fs.cat(filePath);
            if (result.isFailure) {
                // Si falla, añadimos el mensaje de error a la salida y pasamos al siguiente
                outputs.push(`cat: ${filePath}: ${result.getError()}`);
                continue;
            }
            // Si tiene éxito, extraemos el contenido
            outputs.push(result.getValue());
        }
        // Concatenamos el contenido de todos los archivos procesados
        // Usamos un salto de línea para asegurar una separación limpia entre archivos
        const totalContent = outputs.join('\n');
        // Aplicamos la lógica del flag -n sobre la cadena final ya concatenada
        if (hasFlag('-n')) {
            return totalContent.split('\n')
                .map((line, i) => `${(i + 1).toString().padStart(6)}  ${line}`)
                .join('\n');
        }
        return totalContent;
    }
};
