"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathResolver = void 0;
class PathResolver {
    /**
     * Toma una ruta y devuelve el nodo correspondiente o null.
     */
    static resolve(path, currentDirectory, root) {
        if (!path || path === ".")
            return currentDirectory;
        if (path === "/")
            return root;
        // Soporte para home
        let cleanPath = path.startsWith('~') ? path.replace('~', '/home') : path;
        // Determinar punto de inicio
        let current = cleanPath.startsWith('/') ? root : currentDirectory;
        const segments = cleanPath.split('/').filter(Boolean);
        for (const segment of segments) {
            if (segment === '.')
                continue;
            if (segment === '..') {
                current = current.parent || current;
            }
            else {
                const found = current.children.find(child => child.name === segment);
                if (!found)
                    return null;
                current = found;
            }
        }
        return current;
    }
    /**
     * Calcula la ruta absoluta (string) de cualquier nodo.
     */
    static getAbsolutePath(node) {
        let current = node;
        let path = "";
        while (current !== null && current.parent !== null) {
            path = "/" + current.name + path;
            current = current.parent;
        }
        return path || "/";
    }
}
exports.PathResolver = PathResolver;
