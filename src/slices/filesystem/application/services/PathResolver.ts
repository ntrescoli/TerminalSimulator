import { INode } from '../../domain/entities/Node';

export class PathResolver {
    /**
     * El corazón de la navegación. 
     * Toma una ruta y devuelve el nodo correspondiente o null.
     */
    public static resolve(
        path: string, 
        currentDirectory: INode, 
        root: INode
    ): INode | null {
        if (!path || path === ".") return currentDirectory;
        if (path === "/") return root;

        // Soporte para home
        let cleanPath = path.startsWith('~') ? path.replace('~', '/home') : path;
        
        // Determinar punto de inicio
        let current = cleanPath.startsWith('/') ? root : currentDirectory;
        const segments = cleanPath.split('/').filter(Boolean);

        for (const segment of segments) {
            if (segment === '.') continue;
            if (segment === '..') {
                current = current.parent || current;
            } else {
                const found = current.children.find(child => child.name === segment);
                if (!found) return null;
                current = found;
            }
        }
        return current;
    }

    /**
     * Calcula la ruta absoluta (string) de cualquier nodo.
     */
    public static getAbsolutePath(node: INode): string {
        let current: INode | null = node;
        let path = "";
        while (current !== null && current.parent !== null) {
            path = "/" + current.name + path;
            current = current.parent;
        }
        return path || "/";
    }
}