import { INode } from '../../domain/entities/Node';
export declare class PathResolver {
    /**
     * Toma una ruta y devuelve el nodo correspondiente o null.
     */
    static resolve(path: string, currentDirectory: INode, root: INode): INode | null;
    /**
     * Calcula la ruta absoluta (string) de cualquier nodo.
     */
    static getAbsolutePath(node: INode): string;
}
//# sourceMappingURL=PathResolver.d.ts.map