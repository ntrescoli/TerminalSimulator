import { IPermissions } from './Permissions';

// directorios y archivos
export type NodeType = 'file' | 'dir';

export interface INode {
    name: string;
    type: 'file' | 'dir';
    children: INode[];
    parent: INode | null;
    content?: string;
    createdAt: number;
    owner: string;
    group: string;
    mtime?: number;
    permissions: {
        user: IPermissions;
        group: IPermissions;
        others: IPermissions;
    };
}