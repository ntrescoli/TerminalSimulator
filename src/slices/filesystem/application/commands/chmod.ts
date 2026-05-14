import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Chmod: ICommand = {
    name: 'chmod',
    // description: 'Cambia los permisos de acceso a ficheros o directorios',
    execute: async ({ args, fs, env }) => {
        if (args.length < 2) return "usage: chmod <mode> <file>";

        const modeArg = args[0];
        const path = args[1];
        const node = fs.resolvePath(path);

        if (!node) return `chmod: cannot access '${path}': No such file or directory`;

        // 1. Verificación de permisos (Solo root o el dueño pueden hacer chmod)
        const currentUser = env.get('USER');
        if (currentUser !== 'root' && node.owner !== currentUser) {
            return `chmod: changing permissions of '${path}': Operation not permitted`;
        }

        try {
            let newPermissions;

            // MODO A: OCTAL (ej: 755)
            if (/^[0-7]{3}$/.test(modeArg)) {
                newPermissions = parseOctal(modeArg);
            } 
            // MODO B: SIMBÓLICO (ej: u+x, g-w, o=r)
            else {
                newPermissions = parseSymbolic(node.permissions, modeArg);
            }

            node.permissions = newPermissions;
            return ""; // Éxito silencioso
        } catch (e: any) {
            return `chmod: invalid mode: '${modeArg}'`;
        }
    }
};

/**
 * Convierte un número octal (755) al objeto de permisos del Kernel
 */
function parseOctal(octal: string) {
    const digits = octal.split('').map(Number);
    const mapDigit = (digit: number) => ({
        read: !!(digit & 4),
        write: !!(digit & 2),
        execute: !!(digit & 1)
    });

    return {
        user: mapDigit(digits[0]),
        group: mapDigit(digits[1]),
        others: mapDigit(digits[2])
    };
}

/**
 * Maneja lógica compleja como g+w, u=rwx, a-x
 */
function parseSymbolic(current: any, mode: string) {
    // Clonamos los permisos actuales para no mutar por referencia antes de tiempo
    const p = JSON.parse(JSON.stringify(current));
    
    // Regex para capturar: [ugoa] [+-=] [rwx]
    const match = mode.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
    if (!match) throw new Error();

    const [, who, op, what] = match;
    const targets = who === '' || who.includes('a') ? ['user', 'group', 'others'] : [];
    if (who.includes('u')) targets.push('user');
    if (who.includes('g')) targets.push('group');
    if (who.includes('o')) targets.push('others');

    const permKeys: ("read" | "write" | "execute")[] = [];
    if (what.includes('r')) permKeys.push('read');
    if (what.includes('w')) permKeys.push('write');
    if (what.includes('x')) permKeys.push('execute');

    targets.forEach((t: any) => {
        permKeys.forEach(k => {
            if (op === '+') p[t][k] = true;
            if (op === '-') p[t][k] = false;
            if (op === '=') {
                // El '=' es especial: limpia primero los que no están en 'what'
                p[t].read = what.includes('r');
                p[t].write = what.includes('w');
                p[t].execute = what.includes('x');
            }
        });
    });

    return p;
}