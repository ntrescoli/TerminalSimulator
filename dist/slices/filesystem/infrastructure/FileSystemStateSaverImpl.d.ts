import { ISliceStateSaver } from '../../../kernel/domain/ports/out/ISliceStateSaver';
import { FileSystem } from '../application/services/FileSystem';
export declare class FileSystemStateSaverImpl implements ISliceStateSaver {
    private readonly fs;
    readonly key = "fileSystem";
    constructor(fs: FileSystem);
    /**
     * EXPORTACIÓN: Transforma el árbol de INodes en un objeto JSON.
     */
    getState(): any;
    /**
     * Carga el FileSystem a partir del trozo de JSON correspondiente
     */
    loadState(data: any): void;
    /**
     * Reconstruye el árbol desde el JSON de forma recursiva asegurando hidratar la referencia 'parent'
     */
    private reconstructTree;
}
//# sourceMappingURL=FileSystemStateSaverImpl.d.ts.map