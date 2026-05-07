import { ICommand } from '../../types/types';
import { formatHumanSize, formatName } from '../../utils/formatters';

export const Ls: ICommand = {
    name: 'ls',
    execute: ({ args, hasFlag, fs }) => {
        const path = args[0] || '.';
        
        try {
            // 1. Obtener datos crudos
            let nodes = fs.getNodes(path, hasFlag('-a'));

            // 2. Ordenación
            if (hasFlag('-S')) {
                nodes.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
            } else if (hasFlag('-r')) {
                nodes.reverse();
            }

            // 3. Formateo de salida
            if (hasFlag('-l')) {
                return nodes.map(n => {
                    const type = n.type === 'dir' ? 'd' : '-';
                    const perms = `${type}${n.permissions.read ? 'r' : '-'}${n.permissions.write ? 'w' : '-'}${n.permissions.execute ? 'x' : '-'}r-xr-x`;
                    const owner = n.owner.padEnd(8);
                    
                    // Tamaño con soporte para -h
                    const rawSize = n.type === 'dir' ? 4096 : (n.content?.length || 0);
                    const size = hasFlag('-h') ? formatHumanSize(rawSize) : rawSize.toString();
                    
                    const date = new Date(n.createdAt).toLocaleDateString();
                    const name = formatName(n, hasFlag('-F'));

                    return `${perms}  1 ${owner}  ${owner}  ${size.padStart(6)} ${date} ${name}`;
                }).join('\n');
            }

            // Una sola columna
            if (hasFlag('-1')) {
                return nodes.map(n => formatName(n, hasFlag('-F'))).join('\n');
            }

            // Formato normal
            return nodes.map(n => formatName(n, hasFlag('-F'))).join('  ');

        } catch (error: any) {
            return error.message;
        }
    }
};