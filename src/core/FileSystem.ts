import { INode } from '../types/index';
// import type { NodeType } from '../types';

export class FileSystem {
    root: INode;
    currentDirectory: INode;

    constructor() {
        // Creamos el directorio raíz /
        this.root = {
            name: '/',
            type: 'dir',
            children: [],
            parent: null,
            createdAt: Date.now(),
            owner: 'root'
        };

        this.currentDirectory = this.root;
        
        // Creamos una estructura básica inicial
        this.mkdir("home");
        this.mkdir("bin");
        this.mkdir("etc");
        this.mkdir("var");
        
    }

    /**
     * Crea un directorio en la ubicación actual
     */
    mkdir(name: string): void {
        const newDir: INode = {
            name,
            type: 'dir',
            children: [],
            parent: this.currentDirectory,
            createdAt: Date.now(),
            owner: 'root'
        };
        this.currentDirectory.children.push(newDir);
    }

    /**
     * Lista los archivos del directorio actual
     */
    ls(): string[] {
        return this.currentDirectory.children.map(node => 
            node.type === 'dir' ? `${node.name}/` : node.name
        );
    }

    /**
     * Cambia de directorio
     */
    cd(path: string): string | null {
        if (path === "..") {
            if (this.currentDirectory.parent) {
                this.currentDirectory = this.currentDirectory.parent;
            }
            return null;
        }

        const target = this.currentDirectory.children.find(
            n => n.name === path && n.type === 'dir'
        );

        if (target) {
            this.currentDirectory = target;
            return null;
        }

        return `cd: no such file or directory: ${path}`;
    }

    /**
     * Devuelve la ruta absoluta actual (para el comando pwd)
     */
    getPresentWorkingDirectory(): string {
        let current = this.currentDirectory;
        let path = "";
        
        while (current.parent !== null) {
            path = "/" + current.name + path;
            current = current.parent;
        }
        
        return path || "/";
    }

    touch(name: string, content: string = ""): void {
        // Buscar si ya existe para actualizarlo
        const existing = this.currentDirectory.children.find(n => n.name === name);
        if (existing && existing.type === 'file') {
            existing.content = content;
            return;
        }

        const newFile: INode = {
            name,
            type: 'file',
            children: [],
            parent: this.currentDirectory,
            content: content, // <--- ESTO ES CLAVE
            createdAt: Date.now(),
            owner: 'root'
        };
        this.currentDirectory.children.push(newFile);
    }

    // Nuevo método para leer archivos
    cat(name: string): string {
        const node = this.currentDirectory.children.find(n => n.name === name);
        
        if (!node) return `cat: ${name}: No such file or directory`;
        if (node.type === 'dir') return `cat: ${name}: Is a directory`;
        
        return node.content || "";
    }

    // Listado detallado
    lsDetailed(): string[] {
        return this.currentDirectory.children.map(node => {
            const date = new Date(node.createdAt).toLocaleDateString();
            const typeChar = node.type === 'dir' ? 'd' : '-';

            const perms = node.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--';
            const size = node.type === 'dir' ? 4096 : (node.content?.length || 0);

            return `${typeChar}${perms}  root  root  ${size}  ${date}  ${node.name}${node.type === 'dir' ? '/' : ''}`;
        });
    }
}