import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Sudo: ICommand = {
    name: 'sudo',
    execute: async ({ args, kernel, env, userManager, ...context }) => {
        if (args.length === 0) return "usage: sudo <command> [arguments]";

        const currentUser = env.get('USER') || 'guest';

        // 1. Verificación de privilegios de sudoer
        const groups = userManager.getGroups();
        const sudoGroup = groups.find(g => g.groupName === 'sudo' || g.groupName === 'wheel');
        const isSudoer = sudoGroup?.members.includes(currentUser);

        if (currentUser !== 'root' && !isSudoer) {
            return `[sudo] password for ${currentUser}: \nSorry, user ${currentUser} is not allowed to execute sudo. This incident will be reported.`;
        }

        // 2. Preparar el comando a ejecutar
        // Recuperamos la línea en bruto que acabamos de inyectar en el Kernel
        const rawLine = (context as any).rawInput;
        let commandLineToExecute: string;

        if (rawLine) {
            // Quitamos la palabra "sudo" y los espacios que le sigan al principio del string
            // De "sudo rm -r mi_carpeta" pasamos a "rm -r mi_carpeta" con las flags intactas
            commandLineToExecute = rawLine.trim().replace(/^sudo\s+/, '');
        } else {
            // Fallback por si acaso
            commandLineToExecute = args.join(' ');
        }

        // 3. Elevación temporal de privilegios
        const originalUser = currentUser;

        try {
            env.set('USER', 'root');
            env.set('SUDO_USER', originalUser);

            // Cambiamos 'kernel.execute' por el método real de tu kernel que procesa strings.
            // Viendo tu código, si el método que expone tu Kernel se llama 'execute' o 'processCommandLine', úsalo aquí:
            return await kernel.processCommandLine(commandLineToExecute, context.pipeInput);

        } catch (error: any) {
            return `sudo: error executing command: ${error.message}`;
        } finally {
            env.set('USER', originalUser);
            env.set('SUDO_USER', '');
        }
    }
};