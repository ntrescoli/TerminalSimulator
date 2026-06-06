import { INode } from '../../domain/entities/Node';
export declare class AccessControl {
    /**
     * Valida si un usuario tiene permiso para realizar una acción
     */
    static canAccess(node: INode, user: string, action: 'read' | 'write' | 'execute', nodePath: string): boolean;
}
//# sourceMappingURL=AccessControl.d.ts.map