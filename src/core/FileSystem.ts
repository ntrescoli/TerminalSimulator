import { INode } from '../types/types';
import { Environment } from './Environment';

export class FileSystem {
    root: INode;
    currentDirectory: INode;
    private env: Environment;

    constructor(env: Environment) {
        this.env = env;
        // Creamos un estado inicial mínimo (raíz vacía)
        this.root = this.createDefaultRoot();
        this.currentDirectory = this.root;
    }

    private createDefaultRoot(): INode {
        return {
            name: '/',
            type: 'dir',
            children: [],
            parent: null,
            createdAt: Date.now(),
            owner: 'root',
            permissions: { read: true, write: true, execute: true }
        };
    }

    /**
     * Este método lo llamarás desde el Kernel si no hay JSON
     */
    public loadDefaults() {
        this.root = this.createDefaultRoot();
        this.currentDirectory = this.root;

        this.mkdir("home");
        this.mkdir("bin");
        this.mkdir("etc");
        this.mkdir("var");
        this.writeFile("/etc/passwd", "root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000:guest:/home/guest:/bin/bash");
        this.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
    }

    /**
     * Carga el sistema desde un objeto JSON
     */
    public loadFromJSON(jsonData: any) {
        if (!jsonData.fileSystem) return;
        this.root = this.reconstructTree(jsonData.fileSystem, null);
        this.currentDirectory = this.root;
    }

    private reconstructTree(nodeData: any, parent: INode | null): INode {
        const newNode: INode = {
            name: nodeData.name,
            type: nodeData.type,
            owner: nodeData.owner || 'root',
            permissions: nodeData.permissions || { read: true, write: true, execute: true },
            content: nodeData.content || "",
            createdAt: nodeData.createdAt || Date.now(),
            parent: parent,
            children: []
        };

        if (nodeData.children) {
            newNode.children = nodeData.children.map((childData: any) =>
                this.reconstructTree(childData, newNode)
            );
        }

        return newNode;
    }

    // --- MÉTODOS DE DATOS ---

    /**
     * Devuelve los nodos hijos de una ruta. Ideal para comandos que listan.
     */
    public getNodes(path: string = ".", showHidden: boolean = false): INode[] {
        const node = this.resolvePath(path);
        if (!node) throw new Error(`ls: cannot access '${path}': No such file or directory`);

        // Si es un archivo, devolvemos solo ese nodo
        if (node.type === 'file') return [node];

        // Si es un directorio, devolvemos sus hijos filtrados
        let nodes = [...node.children];
        if (!showHidden) {
            nodes = nodes.filter(n => !n.name.startsWith('.'));
        }
        return nodes.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Resuelve una ruta y devuelve el nodo.
     */
    public resolvePath(path: string): INode | null {
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

    /**
     * Devuelve solo los nombres de los hijos del directorio actual
     */
    public readdir(path: string): string[] {
        const node = this.resolvePath(path); // Tu método para buscar el nodo
        if (node && node.type === 'dir' && node.children) {
            return node.children.map(child => child.name);
        }
        return [];
    }

    // --- MÉTODOS DE ACCIÓN ---

    private hasPermission(node: INode, action: 'read' | 'write' | 'execute'): boolean {
        const currentUser = this.env.get('USER');
        if (currentUser === 'root') return true;
        if (currentUser === node.owner) return node.permissions[action];
        return false;
    }

    private createNode(name: string, type: 'dir' | 'file', parent: INode, content: string = ""): INode {
        return {
            name, type, parent, children: [], content,
            createdAt: Date.now(),
            owner: this.env.get('USER') || 'root',
            permissions: { read: true, write: true, execute: type === 'dir' }
        };
    }

    writeFile(path: string, content: string): string | null {
        const processedContent = content.replace(/\\n/g, '\n');
        return this.touch(path, processedContent);
    }

    touch(path: string, content: string = ""): string | null {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash);
        const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);
        const targetDir = this.resolvePath(dirPath);

        if (!targetDir || targetDir.type !== 'dir') return `touch: cannot create '${path}': No such directory`;
        if (!this.hasPermission(targetDir, 'write')) return `touch: '${path}': Permission denied`;

        const existing = targetDir.children.find(n => n.name === fileName);
        if (existing) {
            if (existing.type === 'dir') return `touch: '${path}': Is a directory`;
            if (!this.hasPermission(existing, 'write')) return `touch: '${path}': Permission denied`;
            existing.content = content;
        } else {
            targetDir.children.push(this.createNode(fileName, 'file', targetDir, content));
        }
        return null;
    }

    mkdir(path: string): string | null {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash);
        const dirName = lastSlash === -1 ? path : path.substring(lastSlash + 1);
        const parentDir = this.resolvePath(dirPath);

        if (!parentDir || parentDir.type !== 'dir') return `mkdir: cannot create directory '${path}': No such file or directory`;
        if (!this.hasPermission(parentDir, 'write')) return `mkdir: '${path}': Permission denied`;
        if (parentDir.children.some(n => n.name === dirName)) return `mkdir: cannot create directory '${path}': File exists`;

        parentDir.children.push(this.createNode(dirName, 'dir', parentDir));
        return null;
    }

    changeDirectory(path: string): string | null {
        const target = this.resolvePath(path);
        if (!target) return `cd: no such file or directory: ${path}`;
        if (target.type !== 'dir') return `cd: not a directory: ${path}`;
        this.currentDirectory = target;
        return null;
    }

    cat(path: string): string {
        const node = this.resolvePath(path);
        if (!node) return `cat: ${path}: No such file or directory`;
        if (node.type === 'dir') return `cat: ${path}: Is a directory`;
        if (!this.hasPermission(node, 'read')) return `cat: ${path}: Permission denied`;
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

    /**
     * Convierte el estado actual del FS en un objeto JSON puro (sin referencias circulares)
     */
    public serialize(): any {
        const serializeNode = (node: INode): any => {
            const cleanNode: any = {
                name: node.name,
                type: node.type,
                owner: node.owner,
                permissions: node.permissions,
                content: node.content,
                createdAt: node.createdAt,
                children: []
            };

            if (node.children) {
                cleanNode.children = node.children.map(child => serializeNode(child));
            }

            return cleanNode;
        };

        // DEVOLVEMOS EL NODO DIRECTAMENTE
        return serializeNode(this.root);
    }
}