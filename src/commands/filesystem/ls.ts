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
                    // Permisos detallados
                    const perms = `${type}${n.permissions.read ? 'r' : '-'}${n.permissions.write ? 'w' : '-'}${n.permissions.execute ? 'x' : '-'}r-xr-x`;

                    // --- CAMBIO AQUÍ: DUEÑO Y GRUPO ---
                    const owner = n.owner.padEnd(10);
                    // Usamos n.group si existe, si no, por defecto el mismo que el dueño
                    const group = (n.group || n.owner).padEnd(10);

                    const rawSize = n.type === 'dir' ? 4096 : (n.content?.length || 0);
                    const size = hasFlag('-h') ? formatHumanSize(rawSize) : rawSize.toString();

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

            // ... (resto de tus formatos -1 y normal)
            if (hasFlag('-1')) return nodes.map(n => formatName(n, hasFlag('-F'))).join('\n');
            return nodes.map(n => formatName(n, hasFlag('-F'))).join('  ');

        } catch (error: any) {
            return `ls: cannot access '${path}': No such file or directory`;
        }
    }
};