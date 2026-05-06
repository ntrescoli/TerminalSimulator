import { INode } from '../types/index';

export class FileSystem {
    root: INode;
    currentDirectory: INode;

    constructor() {
        this.root = {
            name: '/',
            type: 'dir',
            children: [],
            parent: null,
            createdAt: Date.now(),
            owner: 'root'
        };

        this.currentDirectory = this.root;
        
        // Inicialización del sistema
        this.mkdir("home");
        this.mkdir("bin");
        this.mkdir("etc");
        this.mkdir("var");
        
        // Creamos un archivo de prueba en una ruta profunda
        this.touch("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
    }

    /**
     * EL CORAZÓN DEL SISTEMA: resuelve rutas como "../../etc/config" o "/bin"
     */
private resolvePath(path: string): INode | null {
    if (!path || path === ".") return this.currentDirectory;
    if (path === "/") return this.root;

    let cleanPath = path;
    if (path.startsWith('~')) {
        cleanPath = path.replace('~', '/home');
    }

    let current = cleanPath.startsWith('/') ? this.root : this.currentDirectory;
    
    // El filter(Boolean) elimina strings vacíos si la ruta empieza por / o tiene //
    const segments = cleanPath.split('/').filter(Boolean);

    for (const segment of segments) {
        if (segment === '.') continue;
        if (segment === '..') {
            current = current.parent || current;
        } else {
            const found = current.children.find(child => child.name === segment);
            if (!found) return null; // Aquí es donde fallaba si el segmento era ".."
            current = found;
        }
    }

    return current;
}

    /**
     * Navegación: cd
     */
changeDirectory(path: string): string | null {
    // Si el usuario escribe "cd /", resolvePath devuelve la raíz directamente
    const target = this.resolvePath(path);

    if (!target) {
        return `cd: no such file or directory: ${path}`;
    }

    if (target.type !== 'dir') {
        return `cd: not a directory: ${path}`;
    }

    this.currentDirectory = target;
    return null; // Retornar null significa "Todo OK"
}

    /**
     * Listado: ls
     */
    ls(path: string = ".", showHidden: boolean = false): string[] {
        const node = this.resolvePath(path);
        
        if (!node) return [`ls: cannot access '${path}': No such file or directory`];
        
        // Si es un archivo, solo listamos el archivo
        if (node.type === 'file') return [node.name];

        let nodes = node.children;
        if (!showHidden) {
            nodes = nodes.filter(n => !n.name.startsWith('.'));
        }

        return nodes.map(n => n.type === 'dir' ? `${n.name}/` : n.name);
    }

    /**
     * Listado Detallado: ls -l
     */
    lsDetailed(path: string = ".", showHidden: boolean = false): string[] {
        const node = this.resolvePath(path);
        if (!node) return [`ls: cannot access '${path}': No such file or directory`];

        const nodesToList = node.type === 'file' ? [node] : node.children;
        
        let filteredNodes = nodesToList;
        if (!showHidden && node.type === 'dir') {
            filteredNodes = nodesToList.filter(n => !n.name.startsWith('.'));
        }

        return filteredNodes.map(n => {
            const date = new Date(n.createdAt).toLocaleDateString();
            const typeChar = n.type === 'dir' ? 'd' : '-';
            const perms = n.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--';
            const size = n.type === 'dir' ? 4096 : (n.content?.length || 0);

            return `${typeChar}${perms}  root  root  ${size}  ${date}  ${n.name}${n.type === 'dir' ? '/' : ''}`;
        });
    }

    /**
     * Lectura: cat
     */
    cat(path: string): string {
        const node = this.resolvePath(path);
        
        if (!node) return `cat: ${path}: No such file or directory`;
        if (node.type === 'dir') return `cat: ${path}: Is a directory`;
        
        return node.content || "";
    }

    /**
     * Escritura: touch y writeFile
     */
touch(path: string, content: string = ""): void {
    const lastSlash = path.lastIndexOf('/');
    const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash);
    const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

    const targetDir = this.resolvePath(dirPath);
    
    if (targetDir && targetDir.type === 'dir') {
        const existing = targetDir.children.find(n => n.name === fileName);
        
        if (existing && existing.type === 'file') {
            // Si ya existe, actualizamos contenido (comportamiento tipo redirección)
            existing.content = content;
        } else {
            // Si no existe, lo creamos
            targetDir.children.push({
                name: fileName,
                type: 'file',
                children: [],
                parent: targetDir,
                content: content,
                createdAt: Date.now(),
                owner: 'root'
            });
        }
    }
}

writeFile(path: string, content: string): void {
    const processedContent = content.replace(/\\n/g, '\n');
    this.touch(path, processedContent);
}

    mkdir(path: string): void {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash);
        const dirName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

        const parentDir = this.resolvePath(dirPath);
        
        if (parentDir && parentDir.type === 'dir') {
            if (!parentDir.children.some(n => n.name === dirName)) {
                parentDir.children.push({
                    name: dirName,
                    type: 'dir',
                    children: [],
                    parent: parentDir,
                    createdAt: Date.now(),
                    owner: 'root'
                });
            }
        }
    }

    getPresentWorkingDirectory(): string {
        let current = this.currentDirectory;
        let path = "";
        while (current.parent !== null) {
            path = "/" + current.name + path;
            current = current.parent;
        }
        return path || "/";
    }
}