"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Touch = void 0;
exports.Touch = {
    name: 'touch',
    execute: ({ args, fs }) => {
        if (args.length < 1)
            return "touch: missing file operand";
        const path = args[0];
        const content = args[1] || ""; // Mantenemos tu soporte para contenido opcional
        // 1. Llamamos al FileSystem (ahora devuelve Result<INode>)
        const result = fs.touch(path, content);
        // 2. Si success es false, devolvemos el string del error       
        if (result.isFailure)
            return `touch: ${result.getError()}`;
        // 3. Si tuvo éxito, devolvemos string vacío (comportamiento Unix)
        return "";
    }
};
