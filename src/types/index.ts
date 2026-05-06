// directorios y archivos
export type NodeType = 'file' | 'dir';

export interface INode {
    name: string;
    type: 'file' | 'dir';
    children: INode[];
    parent: INode | null;
    content?: string;      // Para el comando cat
    createdAt: number;     // Para el comando ls -l
    owner: string;
    // Permisos estilo Unix: r (read), w (write), x (execute)
    permissions: {
        read: boolean;
        write: boolean;
        execute: boolean;
    };
}