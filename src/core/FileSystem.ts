import { INode } from '../types/types';
import { Environment } from './Environment';

export class FileSystem {
    root: INode;
    currentDirectory: INode;
    private env: Environment;

    constructor(env: Environment) {
        this.env = env;
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
            group: 'root', // <-- Añadido grupo raíz
            // permissions: { read: true, write: true, execute: true }
            permissions: {
    user: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    others: { read: true, write: false, execute: false }
}
        };
    }

    public loadDefaults() {
        this.root = this.createDefaultRoot();
        this.currentDirectory = this.root;

        this.mkdir("home");
        this.mkdir("bin");
        this.mkdir("etc");
        this.mkdir("var");
        // Actualizado /etc/passwd y añadido /etc/group por defecto
        this.writeFile("/etc/passwd", "root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000:guest:/home/guest:/bin/bash");
        this.writeFile("/etc/group", "root:x:0:\nsudo:x:27:guest,nico\n");
        this.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
    }

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
            group: nodeData.group || nodeData.owner || 'root', // <-- Recuperar grupo
            permissions: nodeData.permissions || {
                user: { read: true, write: true, execute: nodeData.type === 'dir' },
                group: { read: true, write: false, execute: false },
                others: { read: true, write: false, execute: false }
            },
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

    public getNodes(path: string = ".", showHidden: boolean = false): INode[] {
        const node = this.resolvePath(path);
        if (!node) throw new Error(`ls: cannot access '${path}': No such file or directory`);
        if (node.type === 'file') return [node];

        let nodes = [...node.children];
        if (!showHidden) {
            nodes = nodes.filter(n => !n.name.startsWith('.'));
        }
        return nodes.sort((a, b) => a.name.localeCompare(b.name));
    }

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

    public readdir(path: string): string[] {
        const node = this.resolvePath(path);
        if (node && node.type === 'dir' && node.children) {
            return node.children.map(child => child.name);
        }
        return [];
    }

    public getChildren(path: string): any[] {
        const node = this.resolvePath(path);
        if (node && node.type === 'dir' && node.children) {
            return node.children;
        }
        return [];
    }

    public getAbsolutePath(relativePath: string): string {
        if (relativePath.startsWith('/')) return relativePath;
        const current = this.getPresentWorkingDirectory();
        const base = current === '/' ? '/' : current + '/';
        const full = base + relativePath;
        return full.replace(/\/+/g, '/');
    }

    // --- MÉTODOS DE ACCIÓN ---

    // private hasPermission(node: INode, action: 'read' | 'write' | 'execute'): boolean {
    //     const currentUser = this.env.get('USER');
    //     if (currentUser === 'root') return true;
    //     if (currentUser === node.owner) return node.permissions[action];

    //     // Futura implementación: aquí podrías añadir lógica de grupos
    //     // if (userManager.isUserInGroup(currentUser, node.group)) return node.groupPermissions[action];

    //     return false;
    // }

    private hasPermission(node: INode, action: 'read' | 'write' | 'execute'): boolean {
        const currentUser = this.env.get('USER');
        if (currentUser === 'root') return true;

        // Si intentas escribir en /etc, /bin o /var y no eres root...
        const systemPaths = ['etc', 'bin', 'var'];
        const isSystemNode = systemPaths.some(p => this.getAbsolutePath(node.name).startsWith('/' + p));

        if (isSystemNode && action === 'write') return false;

        // Lógica normal de dueño
        return node.owner === currentUser;
    }

    private createNode(name: string, type: 'dir' | 'file', parent: INode, content: string = ""): INode {
        const currentUser = this.env.get('USER') || 'root';
        return {
            name, type, parent, children: [], content,
            createdAt: Date.now(),
            owner: currentUser,
            group: currentUser, // <-- Por defecto, el grupo es el nombre del usuario (Ubuntu style)
            permissions: {
                user: { read: true, write: true, execute: type === 'dir' },
                group: { read: true, write: false, execute: false },
                others: { read: true, write: false, execute: false }
            }
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

    public serialize(): any {
        const serializeNode = (node: INode): any => {
            const cleanNode: any = {
                name: node.name,
                type: node.type,
                owner: node.owner,
                group: node.group, // <-- Serializar grupo
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
        return serializeNode(this.root);
    }

    public setOwnership(path: string, owner?: string, group?: string): boolean {
        const node = this.resolvePath(path); // Método interno para buscar el archivo
        if (!node) return false;

        if (owner) node.owner = owner;
        if (group) node.group = group; // Asegúrate de que INode tenga este campo

        return true;
    }
}