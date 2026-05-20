import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Ls: ICommand = {
    name: 'ls',
    execute: ({ args, hasFlag, fs }) => {
        const targets = args.length ? args : ['.'];
        const outputs: string[] = [];

        const directoryCount = targets.reduce((count, target) => {
            const node = fs.resolvePath(target);
            return count + (node?.type === 'dir' ? 1 : 0);
        }, 0);

        const useHeaders = directoryCount > 1 || (directoryCount > 0 && targets.length > 1);

        for (const target of targets) {
            const result = fs.getNodes(target, hasFlag('-a'));
            if (result.isFailure) {
                return `ls: ${result.getError()}`;
            }

            const nodes = result.getValue();

            if (hasFlag('-S')) {
                nodes.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
            } else if (hasFlag('-r')) {
                nodes.reverse();
            }

            let formatted: string;

            if (hasFlag('-l')) {
                formatted = nodes.map(n => {
                    const type = n.type === 'dir' ? 'd' : '-';
                    const perms = type +
                        formatPermSet(n.permissions.user) +
                        formatPermSet(n.permissions.group) +
                        formatPermSet(n.permissions.others);
                    const owner = n.owner.padEnd(10);
                    const group = (n.group || n.owner).padEnd(10);
                    const rawSize = n.type === 'dir' ? 4096 : (n.content?.length || 0);
                    const size = hasFlag('-h') ? formatHumanSize(rawSize) : rawSize.toString();
                    const date = new Date(n.createdAt).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    const name = formatName(n, hasFlag('-F'));
                    return `${perms}  1 ${owner} ${group} ${size.padStart(8)} ${date} ${name}`;
                }).join('\n');
            } else {
                formatted = nodes.map(n => formatName(n, hasFlag('-F'))).join(hasFlag('-1') ? '\n' : '  ');
            }

            if (useHeaders) {
                outputs.push(`${target}:`, formatted);
            } else {
                outputs.push(formatted);
            }
        }

        const separator = hasFlag('-1') ? '\n' : (useHeaders ? '\n\n' : '  ');
        return outputs.join(separator);
    },
};

/**
 * Helpers auxiliares (Se mantienen exactamente igual pero tipados)
 */
function formatPermSet(p: { read: boolean; write: boolean; execute: boolean }): string {
    return [
        p.read ? 'r' : '-',
        p.write ? 'w' : '-',
        p.execute ? 'x' : '-',
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