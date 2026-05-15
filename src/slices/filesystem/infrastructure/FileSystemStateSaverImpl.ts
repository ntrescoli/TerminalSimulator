import { ISliceStateSaver } from '@/kernel/domain/ports/out/ISliceStateSaver';
import { FileSystem } from '../application/services/FileSystem';
import { INode } from '../domain/entities/Node';

export class FileSystemStateSaverImpl implements ISliceStateSaver {
    readonly key = 'fileSystem';

    constructor(private fs: FileSystem) { }

    /**
     * EXPORTACIÓN: Transforma el árbol de INodes en un objeto JSON.
     */
    public getState(): any {
        const root = this.fs.getRoot();

        const serializeNode = (node: INode): any => {
            const cleanNode: any = {
                name: node.name,
                type: node.type,
                owner: node.owner,
                group: node.group,
                permissions: node.permissions,
                content: node.content,
                createdAt: node.createdAt,
                children: []
            };

            if (node.children && Array.isArray(node.children)) {
                cleanNode.children = node.children.map(child => serializeNode(child));
            }
            return cleanNode;
        };

        return serializeNode(root);
    }

    /**
     * Carga el FileSystem a partir del trozo de JSON correspondiente
     */
    public loadState(data: any): void {
        if (!data) {
            this.fs.loadDefaults();
            return;
        }

        // 1. Reconstruimos el árbol completo de INodes recursivamente
        const rootNode = this.reconstructTree(data, null);

        // 2. Inyectamos la nueva raíz reconstruida en el servicio de aplicación
        this.fs.setRoot(rootNode);

        // 3. Posicionamos al sistema de archivos en la raíz por defecto tras el booteo
        this.fs.setCurrentDirectory(rootNode);
    }

    /**
     * Reconstruye el árbol desde el JSON de forma recursiva asegurando hidratar la referencia 'parent'
     */
    private reconstructTree(nodeData: any, parent: INode | null = null): INode {
        const newNode: INode = {
            name: nodeData.name,
            type: nodeData.type,
            owner: nodeData.owner || 'root',
            group: nodeData.group || nodeData.owner || 'root',
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

        if (nodeData.children && Array.isArray(nodeData.children)) {
            newNode.children = nodeData.children.map((childData: any) =>
                this.reconstructTree(childData, newNode)
            );
        }

        return newNode;
    }
}