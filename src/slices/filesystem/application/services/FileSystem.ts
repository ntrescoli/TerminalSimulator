import { Result } from '../../../../result/Result';
import { Errors } from '../../../../result/errors';
import { Environment } from '../../../system/domain/entities/Environment';
import { INode } from '../../domain/entities/Node';

import { AccessControl } from './AccessControl';
import { NodeFactory } from './NodeFactory';
import { PathResolver } from './PathResolver';

export class FileSystem {
    private root: INode;
    private currentDirectory: INode;
    private previousDirectory: INode;
    private env: Environment;

    constructor(env: Environment) {
        this.env = env;
        this.root = NodeFactory.create('/', 'dir', 'root');
        this.currentDirectory = this.root;
        this.previousDirectory = this.root;
    }

    public getCurrentDirectory(): INode {
        return this.currentDirectory;
    }

    public setCurrentDirectory(pwd: INode): void {
        this.currentDirectory = pwd;
    }

    public getRoot(): INode {
        return this.root;
    }

    public setRoot(root: INode): void {
        this.root = root;
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

    public resolvePath(path: string): INode | null {
        // return PathResolver.resolve(path, this.currentDirectory, this.root);
        return PathResolver.resolve(path, this.currentDirectory, this.root);
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
            if (existingFile.isSuccess) {
                // Concatenamos: contenido viejo + salto de línea + contenido nuevo
                // El trim() evita que se acumulen infinitos saltos de línea al final
                const newContent = (existingFile.getValue().trimEnd() + '\n' + processedContent).trim();
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
        const targetDir = this.resolvePath(dirPath);

        // 3. Validar existencia del directorio
        if (!targetDir || targetDir.type !== 'dir') {
            return Result.fail<INode>(Errors.FS.NOT_FOUND(path));
        }

        // 4. Validar permisos de escritura en el directorio (para poder crear archivos)
        if (!this.checkAccess(targetDir, 'write')) {
            return Result.fail<INode>(Errors.FS.PERMISSION_DENIED(path));
        }

        // 5. Buscar si ya existe
        const existing = targetDir.children.find(n => n.name === fileName);

        if (existing) {
            // Error si es un directorio
            if (existing.type === 'dir') {
                return Result.fail<INode>(Errors.FS.IS_DIRECTORY(path));
            }

            // Validar permisos sobre el archivo existente
            if (!this.checkAccess(existing, 'write')) {
                return Result.fail<INode>(Errors.FS.PERMISSION_DENIED(path));
            }

            // Actualizar contenido
            existing.content = content;
            return Result.ok<INode>(existing);
        } else {
            // 6. Crear nuevo nodo
            const currentUser = this.env.get('USER') || 'root';
            const newNode = NodeFactory.create(fileName, 'file', currentUser, targetDir, content);

            targetDir.children.push(newNode);
            return Result.ok<INode>(newNode);
        }
    }

    public mkdir(path: string): Result<INode> {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash) || "/";
        const dirName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

        const parentDir = this.resolvePath(dirPath);

        if (!parentDir || parentDir.type !== 'dir') {
            return Result.fail<INode>(Errors.FS.NOT_FOUND(path));
        }

        if (!this.checkAccess(parentDir, 'write')) {
            return Result.fail<INode>(Errors.FS.PERMISSION_DENIED(path));
        }

        if (parentDir.children.some(n => n.name === dirName)) {
            return Result.fail<INode>(Errors.FS.ALREADY_EXISTS(path));
        }

        const newNode = NodeFactory.create(dirName, 'dir', this.env.get('USER'), parentDir);
        parentDir.children.push(newNode);

        return Result.ok<INode>(newNode);
    }

    public remove(path: string, recursive: boolean = false): Result<void> {
        const node = this.resolvePath(path);

        // 1. Validar que el archivo o carpeta exista
        if (!node) {
            return Result.fail<void>(Errors.FS.NOT_FOUND(path));
        }

        // 2. No se puede borrar la raíz '/' ni el directorio actual '.'
        if (node === this.root) {
            return Result.fail<void>("cannot remove root directory '/'");
        }
        if (node === this.currentDirectory) {
            return Result.fail<void>("cannot remove current directory '.' or '..'");
        }

        // 3. Si es un directorio y no se especificó la flag recursiva (-r), Linux lo impide
        if (node.type === 'dir' && !recursive) {
            return Result.fail<void>(Errors.FS.IS_DIRECTORY(path)); // "is a directory"
        }

        // 4. Validar permisos de escritura en el directorio PADRE (para poder alterarlo)
        if (node.parent && !this.checkAccess(node.parent, 'write')) {
            return Result.fail<void>(Errors.FS.PERMISSION_DENIED(path));
        }

        // 5. Proceder al borrado: Lo eliminamos del array de hijos de su padre
        if (node.parent) {
            node.parent.children = node.parent.children.filter(child => child !== node);

            // Rompemos la referencia para ayudar al Garbage Collector
            node.parent = null;
        }

        return Result.ok<void>();
    }

    // @/slices/filesystem/application/services/FileSystem.ts

    public removeDirectory(path: string): Result<void> {
        const node = this.resolvePath(path);

        // 1. Validar existencia
        if (!node) {
            return Result.fail<void>(Errors.FS.NOT_FOUND(path));
        }

        // 2. Validar que sea un directorio
        if (node.type !== 'dir') {
            return Result.fail<void>(`Failed to remove '${path}': Not a directory`);
        }

        // 3. Protección de directorios del sistema/actuales
        if (node === this.root) {
            return Result.fail<void>("cannot remove root directory '/'");
        }
        if (node === this.currentDirectory) {
            return Result.fail<void>("cannot remove current directory '.'");
        }

        // 4. REGLA DE ORO DE RMDIR: Validar si está vacío
        // Si manejas nodos '.' y '..' dentro de children, filtra la longitud:
        // const actualChildren = node.children.filter(c => c.name !== '.' && c.name !== '..');
        const isNotEmpty = node.children.length > 0;

        if (isNotEmpty) {
            return Result.fail<void>(`Failed to remove '${path}': Directory not empty`);
        }

        // 5. Validar permisos de escritura en el directorio padre
        const parentDir = node.parent || this.resolvePath(path + '/..');
        if (parentDir && !this.checkAccess(parentDir, 'write')) {
            return Result.fail<void>(Errors.FS.PERMISSION_DENIED(path));
        }

        // 6. Eliminar el nodo por su nombre
        if (parentDir) {
            parentDir.children = parentDir.children.filter(child => child.name !== node.name);
        }

        return Result.ok<void>();
    }

    public changeDirectory(path: string): Result<void> {
        let target: INode | null = null;
        if (path === '-') {
            target = this.previousDirectory;
        } else {
            target = this.resolvePath(path);
        }
        if (!target) return Result.fail<void>(Errors.FS.NOT_FOUND(path));
        if (target.type !== 'dir') return Result.fail<void>(Errors.FS.NOT_A_DIRECTORY(path));
        this.previousDirectory = this.currentDirectory;
        this.currentDirectory = target;
        return Result.ok<void>();
    }

    public cat(path: string): Result<string> {
        const node = this.resolvePath(path);
        if (!node) return Result.fail<string>(Errors.FS.NOT_FOUND(path));
        if (node.type === 'dir') return Result.fail<string>(Errors.FS.IS_DIRECTORY(path));
        if (!this.checkAccess(node, 'read')) return Result.fail<string>(Errors.FS.PERMISSION_DENIED(path));
        return Result.ok<string>(node.content || "");
    }

    // No se usa
    public getPreviousDirectory(): INode {
        return this.previousDirectory;
    }

    public setOwnership(path: string, owner?: string, group?: string): boolean {
        const node = this.resolvePath(path); // Método interno para buscar el archivo
        if (!node) return false;

        if (owner) node.owner = owner;
        if (group) node.group = group; // Asegúrate de que INode tenga este campo

        return true;
    }

    public getModificationTime(path: string): number {
        return this.resolvePath(path)?.mtime || 0;
    }

    public getType(node: INode): Result<string> {
        if (node.type === 'dir') return Result.ok<string>('dir');
        if (node.type === 'file') return Result.ok<string>('file');
        return Result.fail<string>(Errors.FS.UNKNOWN_TYPE(node.name));
    }

    // --- CARGA INICIAL DE SEGURIDAD (CENTRALIZAR EN EL FUTURO) ---

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

}