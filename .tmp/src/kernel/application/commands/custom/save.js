"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Save = void 0;
exports.Save = {
    name: 'save',
    execute: ({ kernel }) => {
        try {
            // 1. Usamos el nuevo método del Kernel
            const fullData = kernel.exportFullSystemState();
            const jsonString = JSON.stringify(fullData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'system_init.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return "Estado completo del sistema (FS, Users, History) exportado.";
        }
        catch (error) {
            return "Error al exportar: " + error;
        }
    }
};
