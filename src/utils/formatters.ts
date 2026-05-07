export function formatHumanSize(bytes: number): string {
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

export function formatName(node: any, flagF: boolean): string {
    if (node.type === 'dir') return `${node.name}/`;
    if (flagF && node.permissions.execute) return `${node.name}*`;
    return node.name;
}