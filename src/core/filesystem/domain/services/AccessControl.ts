import { INode } from '../entities/Node';

export class AccessControl {
    /**
     * Valida si un usuario tiene permiso para realizar una acción
     */
    public static canAccess(
        node: INode,
        user: string,
        action: 'read' | 'write' | 'execute',
        nodePath: string // Pasamos la ruta para verificar protecciones de sistema
    ): boolean {
        // 1. Root siempre tiene la razón
        if (user === 'root') return true;

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