import { INode } from '../types/index';

export class FileSystem {
    root: INode;
    currentDirectory: INode;

    constructor() {
        // Inicialización de la raíz con permisos por defecto
        this.root = {
            name: '/',
            type: 'dir',
            children: [],
            parent: null,
            createdAt: Date.now(),
            owner: 'root',
            permissions: { read: true, write: true, execute: true }
        };

        this.currentDirectory = this.root;

        // Inicialización del sistema
        this.mkdir("home");
        this.mkdir("bin");
        this.mkdir("etc");
        this.mkdir("var");

        this.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
    }

    /**
     * EL CORAZÓN DEL SISTEMA: resuelve rutas como "../../etc/config" o "/bin"
     */
    private resolvePath(path: string): INode | null {
        if (!path || path === ".") return this.currentDirectory;
        if (path === "/") return this.root;

        let cleanPath = path.startsWith('~') ? path.replace('~', '/home') : path;
        let current = cleanPath.startsWith('/') ? this.root : this.currentDirectory;
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

    private hasPermission(node: INode, action: 'read' | 'write' | 'execute'): boolean {
        const currentUser = "root"; // Provisorio hasta conectar con Environment
        if (currentUser === 'root') return true;
        if (currentUser === node.owner) return node.permissions[action];
        return false;
    }

    private createNode(name: string, type: 'dir' | 'file', parent: INode, content: string = ""): INode {
        return {
            name,
            type,
            parent,
            children: [],
            content,
            createdAt: Date.now(),
            owner: 'root',
            permissions: {
                read: true,
                write: true,
                execute: type === 'dir' // Directorios suelen ser ejecutables para poder entrar en ellos
            }
        };
    }

    /**
     * Escribe un archivo (procesando saltos de línea y permisos)
     */
    writeFile(path: string, content: string): string | null {
        const processedContent = content.replace(/\\n/g, '\n');
        return this.touch(path, processedContent);
    }

    /**
     * Crea un archivo o actualiza su contenido
     */
    touch(path: string, content: string = ""): string | null {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash);
        const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

        const targetDir = this.resolvePath(dirPath);

        if (!targetDir || targetDir.type !== 'dir') return `touch: cannot create '${path}': No such directory`;

        // VALIDACIÓN: ¿Puedo escribir en esta carpeta?
        if (!this.hasPermission(targetDir, 'write')) return `touch: '${path}': Permission denied`;

        const existing = targetDir.children.find(n => n.name === fileName);

        if (existing) {
            if (existing.type === 'dir') return `touch: '${path}': Is a directory`;
            // VALIDACIÓN: ¿Tengo permiso para modificar este archivo existente?
            if (!this.hasPermission(existing, 'write')) return `touch: '${path}': Permission denied`;
            existing.content = content;
        } else {
            targetDir.children.push(this.createNode(fileName, 'file', targetDir, content));
        }

        return null;
    }

    /**
     * Crea un directorio comprobando permisos del padre
     */
    mkdir(path: string): string | null {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash);
        const dirName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

        const parentDir = this.resolvePath(dirPath);

        if (!parentDir || parentDir.type !== 'dir') return `mkdir: cannot create directory '${path}': No such file or directory`;

        // VALIDACIÓN: ¿Puedo escribir en el padre?
        if (!this.hasPermission(parentDir, 'write')) return `mkdir: '${path}': Permission denied`;

        if (parentDir.children.some(n => n.name === dirName)) return `mkdir: cannot create directory '${path}': File exists`;

        parentDir.children.push(this.createNode(dirName, 'dir', parentDir));
        return null;
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

            const r = n.permissions.read ? 'r' : '-';
            const w = n.permissions.write ? 'w' : '-';
            const x = n.permissions.execute ? 'x' : '-';
            const ownerperms = `${r}${w}${x}`;
            const groupperms = `rwx`; // Aún no implementado
            const othersperms = `rwx`; // Aún no implementado

            // const perms = n.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--';
            const size = n.type === 'dir' ? 4096 : (n.content?.length || 0);

            return `${typeChar}${ownerperms}${groupperms}${othersperms}  root  root  ${size}  ${date}  ${n.name}${n.type === 'dir' ? '/' : ''}`;
        });
    }

    /**
     * Lectura: cat
     */
    cat(path: string): string {
        const node = this.resolvePath(path);
        if (!node) return `cat: ${path}: No such file or directory`;
        if (node.type === 'dir') return `cat: ${path}: Is a directory`;

        if (!this.hasPermission(node, 'read')) {
            return `cat: ${path}: Permission denied`;
        }

        return node.content || "";
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