"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
const Result_1 = require("../../../../result/Result");
const errors_1 = require("../../../../result/errors");
const AccessControl_1 = require("./AccessControl");
const NodeFactory_1 = require("./NodeFactory");
const PathResolver_1 = require("./PathResolver");
class FileSystem {
    constructor(env) {
        this.env = env;
        this.root = NodeFactory_1.NodeFactory.create('/', 'dir', 'root');
        this.currentDirectory = this.root;
        this.previousDirectory = this.root;
    }
    getCurrentDirectory() {
        return this.currentDirectory;
    }
    setCurrentDirectory(pwd) {
        this.currentDirectory = pwd;
    }
    getRoot() {
        return this.root;
    }
    setRoot(root) {
        this.root = root;
    }
    checkAccess(node, action) {
        const user = this.env.get('USER') || 'guest';
        const path = PathResolver_1.PathResolver.getAbsolutePath(node);
        return AccessControl_1.AccessControl.canAccess(node, user, action, path);
    }
    // --- MÉTODOS DE DATOS ---
    // public getNodes(path: string = ".", showHidden: boolean = false): INode[] {
    //     const node = this.resolvePath(path);
    //     if (!node) throw new Error(`ls: cannot access '${path}': No such file or directory`);
    //     if (node.type === 'file') return [node];
    //     let nodes = [...node.children];
    //     if (!showHidden) {
    //         nodes = nodes.filter(n => !n.name.startsWith('.'));
    //     }
    //     return nodes.sort((a, b) => a.name.localeCompare(b.name));
    // }
    getNodes(path = ".", showHidden = false) {
        const node = this.resolvePath(path);
        if (!node) {
            return Result_1.Result.fail(`cannot access '${path}': No such file or directory`);
        }
        if (node.type === 'file') {
            return Result_1.Result.ok([node]);
        }
        let nodes = [...node.children];
        if (!showHidden) {
            nodes = nodes.filter(n => !n.name.startsWith('.'));
        }
        return Result_1.Result.ok(nodes.sort((a, b) => a.name.localeCompare(b.name)));
    }
    readdir(path) {
        const node = this.resolvePath(path);
        if (node && node.type === 'dir' && node.children) {
            return node.children.map(child => child.name);
        }
        return [];
    }
    getChildren(path) {
        const node = this.resolvePath(path);
        if (node && node.type === 'dir' && node.children) {
            return node.children;
        }
        return [];
    }
    resolvePath(path) {
        // return PathResolver.resolve(path, this.currentDirectory, this.root);
        return PathResolver_1.PathResolver.resolve(path, this.currentDirectory, this.root);
    }
    // --- MÉTODOS DE ACCIÓN ---
    /**
     * Escribe contenido en un archivo.
     * @param append Si es true, añade al final. Si es false, sobrescribe.
     */
    writeFile(path, content, append = false) {
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
    touch(path, content = "") {
        // 1. Separar ruta y nombre
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash) || "/";
        const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);
        // 2. Resolver directorio padre
        const targetDir = this.resolvePath(dirPath);
        // 3. Validar existencia del directorio
        if (!targetDir || targetDir.type !== 'dir') {
            return Result_1.Result.fail(errors_1.Errors.FS.NOT_FOUND(path));
        }
        // 4. Validar permisos de escritura en el directorio (para poder crear archivos)
        if (!this.checkAccess(targetDir, 'write')) {
            return Result_1.Result.fail(errors_1.Errors.FS.PERMISSION_DENIED(path));
        }
        // 5. Buscar si ya existe
        const existing = targetDir.children.find(n => n.name === fileName);
        if (existing) {
            if (existing.type === 'dir') {
                return Result_1.Result.fail(errors_1.Errors.FS.IS_DIRECTORY(path));
            }
            if (!this.checkAccess(existing, 'write')) {
                return Result_1.Result.fail(errors_1.Errors.FS.PERMISSION_DENIED(path));
            }
            // 🌟 CORRECCIÓN REAL: touch NO debe sobreescribir el contenido con un string vacío 
            // si el archivo ya tenía datos, a menos que se mande contenido explícitamente.
            if (content !== "") {
                existing.content = content;
            }
            // Aquí deberías actualizar el mtime de tu nodo existente
            // existing.mtime = Date.now(); 
            return Result_1.Result.ok(existing);
        }
        else {
            // 6. Crear nuevo nodo
            const currentUser = this.env.get('USER') || 'root';
            const newNode = NodeFactory_1.NodeFactory.create(fileName, 'file', currentUser, targetDir, content);
            targetDir.children.push(newNode);
            return Result_1.Result.ok(newNode);
        }
    }
    mkdir(path) {
        const lastSlash = path.lastIndexOf('/');
        const dirPath = lastSlash === -1 ? "." : path.substring(0, lastSlash) || "/";
        const dirName = lastSlash === -1 ? path : path.substring(lastSlash + 1);
        const parentDir = this.resolvePath(dirPath);
        if (!parentDir || parentDir.type !== 'dir') {
            return Result_1.Result.fail(errors_1.Errors.FS.NOT_FOUND(path));
        }
        if (!this.checkAccess(parentDir, 'write')) {
            return Result_1.Result.fail(errors_1.Errors.FS.PERMISSION_DENIED(path));
        }
        if (parentDir.children.some(n => n.name === dirName)) {
            return Result_1.Result.fail(errors_1.Errors.FS.ALREADY_EXISTS(path));
        }
        const newNode = NodeFactory_1.NodeFactory.create(dirName, 'dir', this.env.get('USER'), parentDir);
        parentDir.children.push(newNode);
        return Result_1.Result.ok(newNode);
    }
    remove(path, recursive = false) {
        const node = this.resolvePath(path);
        // 1. Validar que el archivo o carpeta exista
        if (!node) {
            return Result_1.Result.fail(errors_1.Errors.FS.NOT_FOUND(path));
        }
        // 2. No se puede borrar la raíz '/' ni el directorio actual '.'
        if (node === this.root) {
            return Result_1.Result.fail("cannot remove root directory '/'");
        }
        if (node === this.currentDirectory) {
            return Result_1.Result.fail("cannot remove current directory '.' or '..'");
        }
        // 3. Si es un directorio y no se especificó la flag recursiva (-r), Linux lo impide
        if (node.type === 'dir' && !recursive) {
            return Result_1.Result.fail(errors_1.Errors.FS.IS_DIRECTORY(path)); // "is a directory"
        }
        // 4. Validar permisos de escritura en el directorio PADRE (para poder alterarlo)
        if (node.parent && !this.checkAccess(node.parent, 'write')) {
            return Result_1.Result.fail(errors_1.Errors.FS.PERMISSION_DENIED(path));
        }
        // 5. Proceder al borrado: Lo eliminamos del array de hijos de su padre
        if (node.parent) {
            node.parent.children = node.parent.children.filter(child => child !== node);
            // Rompemos la referencia para ayudar al Garbage Collector
            node.parent = null;
        }
        return Result_1.Result.ok();
    }
    // @/slices/filesystem/application/services/FileSystem.ts
    removeDirectory(path) {
        const node = this.resolvePath(path);
        // 1. Validar existencia
        if (!node) {
            return Result_1.Result.fail(errors_1.Errors.FS.NOT_FOUND(path));
        }
        // 2. Validar que sea un directorio
        if (node.type !== 'dir') {
            return Result_1.Result.fail(`Failed to remove '${path}': Not a directory`);
        }
        // 3. Protección de directorios del sistema/actuales
        if (node === this.root) {
            return Result_1.Result.fail("cannot remove root directory '/'");
        }
        if (node === this.currentDirectory) {
            return Result_1.Result.fail("cannot remove current directory '.'");
        }
        // 4. REGLA DE ORO DE RMDIR: Validar si está vacío
        // Si manejas nodos '.' y '..' dentro de children, filtra la longitud:
        // const actualChildren = node.children.filter(c => c.name !== '.' && c.name !== '..');
        const isNotEmpty = node.children.length > 0;
        if (isNotEmpty) {
            return Result_1.Result.fail(`Failed to remove '${path}': Directory not empty`);
        }
        // 5. Validar permisos de escritura en el directorio padre
        const parentDir = node.parent || this.resolvePath(path + '/..');
        if (parentDir && !this.checkAccess(parentDir, 'write')) {
            return Result_1.Result.fail(errors_1.Errors.FS.PERMISSION_DENIED(path));
        }
        // 6. Eliminar el nodo por su nombre
        if (parentDir) {
            parentDir.children = parentDir.children.filter(child => child.name !== node.name);
        }
        return Result_1.Result.ok();
    }
    changeDirectory(path) {
        let target = null;
        if (path === '-') {
            target = this.previousDirectory;
        }
        else {
            target = this.resolvePath(path);
        }
        if (!target)
            return Result_1.Result.fail(errors_1.Errors.FS.NOT_FOUND(path));
        if (target.type !== 'dir')
            return Result_1.Result.fail(errors_1.Errors.FS.NOT_A_DIRECTORY(path));
        this.previousDirectory = this.currentDirectory;
        this.currentDirectory = target;
        return Result_1.Result.ok();
    }
    cat(path) {
        const node = this.resolvePath(path);
        if (!node)
            return Result_1.Result.fail(errors_1.Errors.FS.NOT_FOUND(path));
        if (node.type === 'dir')
            return Result_1.Result.fail(errors_1.Errors.FS.IS_DIRECTORY(path));
        if (!this.checkAccess(node, 'read'))
            return Result_1.Result.fail(errors_1.Errors.FS.PERMISSION_DENIED(path));
        return Result_1.Result.ok(node.content || "");
    }
    /**
     * Realiza una lectura directa de un archivo del sistema ignorando las restricciones
     * de permisos del usuario actual. Exclusivo para componentes del Kernel.
     */
    catSystem(path) {
        // 1. Aquí usas la lógica exacta que ya tienes en tu 'cat' para resolver la ruta 
        // y encontrar el nodo del archivo (usando tu PathResolver o lógica interna).
        const node = this.resolvePath(path);
        if (!node) {
            return Result_1.Result.fail("File not found"); // O como manejes tus errores
        }
        if (node.type !== 'file') {
            return Result_1.Result.fail("Not a file");
        }
        // 🌟 LA CLAVE: Devolvemos el contenido DIRECTAMENTE, 
        // sin pasar por el 'if (hasPermission(...))' que te estaba bloqueando.
        return Result_1.Result.ok(node.content);
    }
    // No se usa
    getPreviousDirectory() {
        return this.previousDirectory;
    }
    // public setOwnership(path: string, owner?: string, group?: string): boolean {
    //     const node = this.resolvePath(path);
    //     if (!node) return false;
    //     if (owner !== undefined) node.owner = owner;
    //     if (group !== undefined) node.group = group;
    //     return true;
    // }
    /**
     * Cambia el propietario y/o grupo de un nodo de forma segura.
     * @returns Un Result que indica éxito o el mensaje de error específico de Unix.
     */
    setOwnership(path, currentUser, groupMembers, // Pasamos los miembros del grupo destino para validar
    owner, group) {
        const node = this.resolvePath(path); // Tu método interno existente
        if (!node) {
            return Result_1.Result.fail(`cannot access '${path}': No such file or directory`);
        }
        if (currentUser !== 'root') {
            // Regla 1: Solo el dueño del archivo puede cambiar sus atributos
            if (node.owner !== currentUser) {
                return Result_1.Result.fail(`changing group of '${path}': Operation not permitted`);
            }
            // Regla 2: Si cambias el grupo, debes pertenecer al grupo de destino
            if (group !== undefined && !groupMembers.includes(currentUser)) {
                return Result_1.Result.fail(`changing group of '${path}': Group membership required`);
            }
        }
        if (owner !== undefined)
            node.owner = owner;
        if (group !== undefined)
            node.group = group;
        return Result_1.Result.ok();
    }
    getModificationTime(path) {
        return this.resolvePath(path)?.mtime || 0;
    }
    getType(node) {
        if (node.type === 'dir')
            return Result_1.Result.ok('dir');
        if (node.type === 'file')
            return Result_1.Result.ok('file');
        return Result_1.Result.fail(errors_1.Errors.FS.UNKNOWN_TYPE(node.name));
    }
    /**
     * Método auxiliar para clonar un nodo en profundidad (Deep Copy)
     */
    cloneNode(node, newParent = null) {
        // Creamos una copia exacta del nodo actual utilizando tu factoría o constructor
        // Asegúrate de adaptar esta línea a cómo creas tus nodos (NodeFactory, etc.)
        const cloned = {
            ...node,
            parent: newParent,
            // Clonamos recursivamente los hijos si es un directorio
            children: []
        };
        if (node.children) {
            cloned.children = node.children.map(child => this.cloneNode(child, cloned));
        }
        return cloned;
    }
    copy(srcPath, destPath, recursive = false) {
        const srcNode = PathResolver_1.PathResolver.resolve(srcPath, this.currentDirectory, this.root);
        if (!srcNode)
            return Result_1.Result.fail(`cp: cannot stat '${srcPath}': No such file or directory`);
        // Protección contra copia recursiva
        if (srcNode.type === 'dir' && !recursive) {
            return Result_1.Result.fail(`cp: -r not specified; omitting directory '${srcPath}'`);
        }
        // Resolvemos el destino
        let destNode = PathResolver_1.PathResolver.resolve(destPath, this.currentDirectory, this.root);
        let targetParent = null;
        let newName = srcNode.name;
        if (destNode && destNode.type === 'dir') {
            // Caso A: El destino es un directorio existente -> copiamos DENTRO de él
            targetParent = destNode;
        }
        else {
            // Caso B: El destino no existe o es un archivo -> el último segmento es el nuevo nombre
            const lastSlash = destPath.lastIndexOf('/');
            if (lastSlash === -1) {
                targetParent = this.currentDirectory;
                newName = destPath;
            }
            else {
                const parentPath = destPath.substring(0, lastSlash) || '/';
                targetParent = PathResolver_1.PathResolver.resolve(parentPath, this.currentDirectory, this.root);
                newName = destPath.substring(lastSlash + 1);
            }
        }
        if (!targetParent || targetParent.type !== 'dir') {
            return Result_1.Result.fail(`cp: cannot create regular file '${destPath}': Not a directory`);
        }
        // Clonamos el nodo en profundidad y lo añadimos al padre destino
        const duplicate = this.cloneNode(srcNode, targetParent);
        duplicate.name = newName;
        // Si ya existía un archivo con ese nombre en el destino, lo reemplazamos
        targetParent.children = targetParent.children.filter(c => c.name !== newName);
        targetParent.children.push(duplicate);
        return Result_1.Result.ok();
    }
    move(srcPath, destPath) {
        const srcNode = PathResolver_1.PathResolver.resolve(srcPath, this.currentDirectory, this.root);
        if (!srcNode)
            return Result_1.Result.fail(`mv: cannot stat '${srcPath}': No such file or directory`);
        if (srcNode === this.root)
            return Result_1.Result.fail("mv: cannot move root directory '/'");
        let destNode = PathResolver_1.PathResolver.resolve(destPath, this.currentDirectory, this.root);
        let targetParent = null;
        let newName = srcNode.name;
        if (destNode && destNode.type === 'dir') {
            targetParent = destNode;
        }
        else {
            const lastSlash = destPath.lastIndexOf('/');
            if (lastSlash === -1) {
                targetParent = this.currentDirectory;
                newName = destPath;
            }
            else {
                const parentPath = destPath.substring(0, lastSlash) || '/';
                targetParent = PathResolver_1.PathResolver.resolve(parentPath, this.currentDirectory, this.root);
                newName = destPath.substring(lastSlash + 1);
            }
        }
        if (!targetParent || targetParent.type !== 'dir') {
            return Result_1.Result.fail(`mv: cannot move to '${destPath}': Not a directory`);
        }
        // --- OPERACIÓN CORTAR Y PEGAR ---
        // 1. Quitar del padre original
        if (srcNode.parent) {
            srcNode.parent.children = srcNode.parent.children.filter(c => c !== srcNode);
        }
        // 2. Asignar nuevo padre y nombre
        srcNode.parent = targetParent;
        srcNode.name = newName;
        // 3. Insertar en el destino (reemplazando si ya existía)
        targetParent.children = targetParent.children.filter(c => c.name !== newName);
        targetParent.children.push(srcNode);
        return Result_1.Result.ok();
    }
    // --- CARGA INICIAL DE SEGURIDAD (CENTRALIZAR EN EL FUTURO) ---
    loadDefaults() {
        this.root = NodeFactory_1.NodeFactory.create('/', 'dir', 'root');
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
exports.FileSystem = FileSystem;
