import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Rmdir: ICommand = {
    name: 'rmdir',
    execute: ({ args, fs }) => {
        if (args.length < 1) {
            return "rmdir: missing operand";
        }

        const path = args[0];
        const result = fs.removeDirectory(path);

        if (result.isFailure) {
            // Replicamos el prefijo de error nativo de Bash
            return `rmdir: ${result.getError()}`;
        }

        // Éxito silencioso al estilo Unix
        return "";
    }
};