import { INode } from '../../types/types';

export class NodeFactory {
    /**
     * Crea un nodo desde cero (para mkdir, touch, etc.)
     */
    public static create(
        name: string, 
        type: 'dir' | 'file', 
        owner: string, 
        parent: INode | null = null, 
        content: string = ""
    ): INode {
        return {
            name,
            type,
            parent,
            content,
            children: [],
            createdAt: Date.now(),
            owner: owner,
            group: owner, // Estilo Unix: el grupo principal es el nombre del usuario
            permissions: {
                user: { read: true, write: true, execute: type === 'dir' },
                group: { read: true, write: false, execute: type === 'dir' },
                others: { read: true, write: false, execute: type === 'dir' }
            }
        };
    }

    /**
     * Reconstruye el árbol desde el JSON de forma recursiva
     */
    public static reconstruct(nodeData: any, parent: INode | null = null): INode {
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

        if (nodeData.children) {
            newNode.children = nodeData.children.map((childData: any) =>
                this.reconstruct(childData, newNode)
            );
        }

        return newNode;
    }
}