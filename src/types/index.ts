// directorios y archivos
export type NodeType = 'file' | 'dir';

export interface INode {
    name: string;
    type: 'file' | 'dir';
    children: INode[];
    parent: INode | null;
    content?: string;      // Para el comando cat
    createdAt: number;     // Para el comando ls -l
    owner: string;         // Para el comando ls -l
}