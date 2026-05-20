"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControl = void 0;
class AccessControl {
    /**
     * Valida si un usuario tiene permiso para realizar una acción
     */
    static canAccess(node, user, action, nodePath // Pasamos la ruta para verificar protecciones de sistema
    ) {
        // 1. Root siempre tiene la razón
        if (user === 'root')
            return true;
        // 2. Protección de rutas críticas (tu lógica original)
        const systemPaths = ['/etc', '/bin', '/var', '/sbin'];
        const isSystemArea = systemPaths.some(p => nodePath.startsWith(p));
        if (isSystemArea && action === 'write') {
            return false;
        }
        // 3. Lógica de permisos por dueño (simplificada por ahora)
        // Más adelante aquí añadiremos la lógica de grupos (node.permissions.group)
        if (node.owner === user) {
            return node.permissions.user[action];
        }
        // 4. Otros
        return node.permissions.others[action];
    }
}
exports.AccessControl = AccessControl;
