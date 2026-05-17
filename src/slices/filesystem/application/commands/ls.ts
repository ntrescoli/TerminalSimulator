import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Ls: ICommand = {
    name: 'ls',
    execute: ({ args, hasFlag, fs }) => {
        const path = args[0] || '.';
        
        // 1. Llamamos al FileSystem y obtenemos el objeto Result
        const result = fs.getNodes(path, hasFlag('-a'));

        // 2. Si falló la resolución, formateamos el error genérico añadiendo el prefijo "ls:"
        if (result.isFailure) {
            return `ls: ${result.getError()}`;
        }

        // 3. Si tuvo éxito, extraemos la lista de nodos de forma segura
        let nodes = result.getValue();

        // 4. Ordenación de los nodos
        if (hasFlag('-S')) {
            nodes.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
        } else if (hasFlag('-r')) {
            // El sort alfabético inicial se puede revertir directamente
            nodes.reverse();
        }

        // 5. Formateo de salida larga (-l)
        if (hasFlag('-l')) {
            return nodes.map(n => {
                // TIPO DE NODO
                const type = n.type === 'dir' ? 'd' : '-';

                // RENDERIZADO DE PERMISOS REALES
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

                // Formato estándar de salida larga Unix
                return `${perms}  1 ${owner} ${group} ${size.padStart(8)} ${date} ${name}`;
            }).join('\n');
        }

        // 6. Formateo de salidas alternativas de una sola columna o en línea
        if (hasFlag('-1')) {
            return nodes.map(n => formatName(n, hasFlag('-F'))).join('\n');
        }
        
        return nodes.map(n => formatName(n, hasFlag('-F'))).join('  ');
    }
};

/**
 * Helpers auxiliares (Se mantienen exactamente igual pero tipados)
 */
function formatPermSet(p: { read: boolean; write: boolean; execute: boolean }): string {
    return [
        p.read ? 'r' : '-',
        p.write ? 'w' : '-',
        p.execute ? 'x' : '-'
    ].join('');
}

function formatHumanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    const units = ['K', 'M', 'G'];
    let unitIndex = -1;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)}${units[unitIndex]}`;
}

function formatName(node: any, flagF: boolean): string {
    if (node.type === 'dir') return `${node.name}/`;
    if (flagF && node.permissions.execute) return `${node.name}*`;
    return node.name;
}