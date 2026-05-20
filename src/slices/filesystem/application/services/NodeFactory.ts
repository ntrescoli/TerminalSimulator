import type { INode } from '../../domain/entities/Node';

export class NodeFactory {
    /**
     * Crea un nodo desde cero (para mkdir, touch, etc.)
     */
    public static create(
        name: string, 
        type: 'dir' | 'file', 
        owner: string, 
        parent: INode | null = null, 
        content = '',
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
                others: { read: true, write: false, execute: type === 'dir' },
            },
        };
    }
    
}