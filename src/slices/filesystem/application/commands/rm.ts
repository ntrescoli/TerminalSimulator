import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Rm: ICommand = {
    name: 'rm',
    execute: ({ args, hasFlag, fs }) => {
        // Como tu parser ya limpió las flags, args[0] es DIRECTAMENTE la ruta
        if (args.length < 1) {
            return "rm: missing operand";
        }

        const path = args[0];
        
        // Tu parser soporta perfectamente clusters, así que hasFlag funcionará de 10
        const recursive = hasFlag('-r') || hasFlag('-R');
        const force = hasFlag('-f');

        // Ejecutamos la acción en el FileSystem
        const result = fs.remove(path, recursive);

        if (result.isFailure) {
            // Comportamiento -f: si no existe el archivo/carpeta, morimos en silencio
            if (force && /not found|No such file or directory/i.test(result.getError())) {
                return "";
            }
            
            return `rm: cannot remove '${path}': ${result.getError()}`;
        }

        return ""; // Éxito silencioso
    }
};