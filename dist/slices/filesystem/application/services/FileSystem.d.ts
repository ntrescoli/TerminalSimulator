import { Result } from '../../../../result/Result';
import { Environment } from '../../../system/domain/entities/Environment';
import { INode } from '../../domain/entities/Node';
export declare class FileSystem {
    private root;
    private currentDirectory;
    private previousDirectory;
    private readonly env;
    constructor(env: Environment);
    getCurrentDirectory(): INode;
    setCurrentDirectory(pwd: INode): void;
    getRoot(): INode;
    setRoot(root: INode): void;
    private checkAccess;
    getNodes(path?: string, showHidden?: boolean): Result<INode[]>;
    readdir(path: string): string[];
    getChildren(path: string): any[];
    resolvePath(path: string): INode | null;
    /**
     * Escribe contenido en un archivo.
     * @param append Si es true, añade al final. Si es false, sobrescribe.
     */
    writeFile(path: string, content: string, append?: boolean): Result<INode>;
    /**
     * Crea un archivo o actualiza su contenido.
     * Devuelve Result<INode> para que el llamador tenga acceso al nodo creado/modificado.
     */
    touch(path: string, content?: string): Result<INode>;
    mkdir(path: string): Result<INode>;
    remove(path: string, recursive?: boolean): Result<void>;
    removeDirectory(path: string): Result<void>;
    changeDirectory(path: string): Result<void>;
    cat(path: string): Result<string>;
    /**
     * Realiza una lectura directa de un archivo del sistema ignorando las restricciones
     * de permisos del usuario actual. Exclusivo para componentes del Kernel.
     */
    catSystem(path: string): Result<string>;
    getPreviousDirectory(): INode;
    /**
     * Cambia el propietario y/o grupo de un nodo de forma segura.
     * @returns Un Result que indica éxito o el mensaje de error específico de Unix.
     */
    setOwnership(path: string, currentUser: string, groupMembers: string[], // Pasamos los miembros del grupo destino para validar
    owner?: string, group?: string): Result<void>;
    getModificationTime(path: string): number;
    getType(node: INode): Result<string>;
    /**
     * Método auxiliar para clonar un nodo en profundidad (Deep Copy)
     */
    private cloneNode;
    copy(srcPath: string, destPath: string, recursive?: boolean): Result<void>;
    move(srcPath: string, destPath: string): Result<void>;
    loadDefaults(): void;
}
//# sourceMappingURL=FileSystem.d.ts.map