import { INode } from '../../domain/entities/Node';
export declare class NodeFactory {
    /**
     * Crea un nodo desde cero (para mkdir, touch, etc.)
     */
    static create(name: string, type: 'dir' | 'file', owner: string, parent?: INode | null, content?: string): INode;
}
//# sourceMappingURL=NodeFactory.d.ts.map