import { Result } from '../../../../result/Result';
import { Errors } from '../../../../result/errors';
import { Environment } from '../../../system/domain/entities/Environment';
import { INode } from '../entities/Node';

import { AccessControl } from './AccessControl';
import { NodeFactory } from './NodeFactory';
import { PathResolver } from './PathResolver';

export class FileSystem {
    root: INode;
    currentDirectory: INode;
    private env: Environment;

    constructor(env: Environment) {
        this.env = env;
        this.root = NodeFactory.create('/', 'dir', 'root');
        this.currentDirectory = this.root;
    }

    public loadDefaults() {
        this.root = NodeFactory.create('/', 'dir', 'root');
        this.currentDirectory = this.root;

        this.mkdir("home");
        this.mkdir("bin");
        this.mkdir("etc");
        this.mkdir("var");
        this.writeFile("/etc/passwd", "root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000:guest:/home/guest:/bin/bash");
        this.writeFile("/etc/group", "root:x:0:\nsudo:x:27:guest,nico\n");
        this.writeFile("home/readme.txt", "Bienvenido al sistema de archivos avanzado.");
    }

    public loadFromJSON(jsonData: any) {
        if (!jsonData.fileSystem) return;
        this.root = NodeFactory.reconstruct(jsonData.fileSystem, null);
        this.currentDirectory = this.root;
    }

    private checkAccess(node: INode, action: 'read' | 'write' | 'execute'): boolean {
        const user = this.env.get('USER') || 'guest';
        const path = PathResolver.getAbsolutePath(node);
        return AccessControl.canAccess(node, user, action, path);
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
        return PathResolver.resolve(path, this.currentDirectory, this.root);
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

    // --- MÉTODOS DE ACCIÓN ---

    /**
     * Escribe contenido en un archivo.
     * @param append Si es true, añade al final. Si es false, sobrescribe.
     */
    public writeFile(path: string, content: string, append: boolean = false): Result<INode> {
        const processedContent = content.replace(/\\n/g, '\n');

        // Si queremos añadir contenido, primero intentamos leer lo que ya hay
        if (append) {
            const existingFile = this.cat(path);
            if (existingFile.success) {
                // Concatenamos: contenido viejo + salto de línea + contenido nuevo
                // El trim() evita que se acumulen infinitos saltos de línea al final
                const newContent = (existingFile.data.trimEnd() + '\n' + processedContent).trim();
                return this.touch(path, newContent);
            }
            // Si el archivo no existe, touch lo creará de todos modos, 
            // así que seguimos adelante.
        }

        return this.touch(path, processedContent);
    }

    /**
     * Crea un archivo o actualiza su contenido.
     * Devuelve Result<INode> para que el llamador tenga acceso al nodo creado/modificado.
     */
    public touch(path: string, content: string = ""): Result<INode> {
        // 1. Separar ruta y nombre
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash) || "/";
        const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

        // 2. Resolver directorio padre
        const targetDir = PathResolver.resolve(dirPath, this.currentDirectory, this.root);

        // 3. Validar existencia del directorio
        if (!targetDir || targetDir.type !== 'dir') {
            return { success: false, error: Errors.NOT_FOUND(path) };
        }

        // 4. Validar permisos de escritura en el directorio (para poder crear archivos)
        if (!this.checkAccess(targetDir, 'write')) {
            return { success: false, error: Errors.PERMISSION_DENIED(path) };
        }

        // 5. Buscar si ya existe
        const existing = targetDir.children.find(n => n.name === fileName);

        if (existing) {
            // Error si es un directorio
            if (existing.type === 'dir') {
                return { success: false, error: Errors.IS_DIRECTORY(path) };
            }

            // Validar permisos sobre el archivo existente
            if (!this.checkAccess(existing, 'write')) {
                return { success: false, error: Errors.PERMISSION_DENIED(path) };
            }

            // Actualizar contenido
            existing.content = content;
            return { success: true, data: existing };
        } else {
            // 6. Crear nuevo nodo
            const currentUser = this.env.get('USER') || 'root';
            const newNode = NodeFactory.create(fileName, 'file', currentUser, targetDir, content);

            targetDir.children.push(newNode);
            return { success: true, data: newNode };
        }
    }

    public mkdir(path: string): Result<INode> {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash) || "/";
        const dirName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

        const parentDir = PathResolver.resolve(dirPath, this.currentDirectory, this.root);

        if (!parentDir || parentDir.type !== 'dir') {
            return { success: false, error: Errors.NOT_FOUND(path) };
        }

        if (!this.checkAccess(parentDir, 'write')) {
            return { success: false, error: Errors.PERMISSION_DENIED(path) };
        }

        if (parentDir.children.some(n => n.name === dirName)) {
            return { success: false, error: Errors.ALREADY_EXISTS(path) };
        }

        const newNode = NodeFactory.create(dirName, 'dir', this.env.get('USER'), parentDir);
        parentDir.children.push(newNode);

        return { success: true, data: newNode };
    }

    public changeDirectory(path: string): string | null {
        const target = this.resolvePath(path);
        if (!target) return `cd: no such file or directory: ${path}`;
        if (target.type !== 'dir') return `cd: not a directory: ${path}`;
        this.currentDirectory = target;
        return null;
    }

    public cat(path: string): Result<string> {
        const node = PathResolver.resolve(path, this.currentDirectory, this.root);
        if (!node) return { success: false, error: Errors.NOT_FOUND(path) };
        if (node.type === 'dir') return { success: false, error: Errors.IS_DIRECTORY(path) };
        if (!this.checkAccess(node, 'read')) return { success: false, error: Errors.PERMISSION_DENIED(path) };
        return { success: true, data: node.content || "" };
    }

    public getPresentWorkingDirectory(): string {
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