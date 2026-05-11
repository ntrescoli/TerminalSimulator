import { ICommand } from '../../types/types';
import { formatHumanSize, formatName } from '../../utils/formatters';

export const Ls: ICommand = {
    name: 'ls',
    execute: ({ args, hasFlag, fs }) => {
        const path = args[0] || '.';
        
        try {
            let nodes = fs.getNodes(path, hasFlag('-a'));

            // 1. Ordenación
            if (hasFlag('-S')) {
                nodes.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
            } else if (hasFlag('-r')) {
                nodes.reverse();
            }

            // 2. Formateo de salida
            if (hasFlag('-l')) {
                return nodes.map(n => {
                    // TIPO DE NODO
                    const type = n.type === 'dir' ? 'd' : '-';

                    // --- CAMBIO AQUÍ: RENDERIZADO DE PERMISOS REALES ---
                    const perms = type + 
                        formatPermSet(n.permissions.user) + 
                        formatPermSet(n.permissions.group) + 
                        formatPermSet(n.permissions.others);

                    // DUEÑO Y GRUPO
                    const owner = n.owner.padEnd(10);
                    const group = (n.group || n.owner).padEnd(10);

                    // TAMAÑO
                    const rawSize = n.type === 'dir' ? 4096 : (n.content?.length || 0);
                    const size = hasFlag('-h') ? formatHumanSize(rawSize) : rawSize.toString();

                    // FECHA
                    const date = new Date(n.createdAt).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const name = formatName(n, hasFlag('-F'));

                    // Formato: permisos links owner group size date name
                    return `${perms}  1 ${owner} ${group} ${size.padStart(8)} ${date} ${name}`;
                }).join('\n');
            }

            if (hasFlag('-1')) return nodes.map(n => formatName(n, hasFlag('-F'))).join('\n');
            return nodes.map(n => formatName(n, hasFlag('-F'))).join('  ');

        } catch (error: any) {
            return `ls: cannot access '${path}': No such file or directory`;
        }
    }
};

/**
 * Helper para convertir un objeto IPermissions (r,w,x) en string "rwx" o "---"
 */
function formatPermSet(p: { read: boolean; write: boolean; execute: boolean }): string {
    return [
        p.read ? 'r' : '-',
        p.write ? 'w' : '-',
        p.execute ? 'x' : '-'
    ].join('');
}