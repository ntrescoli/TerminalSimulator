import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Sudo: ICommand = {
    name: 'sudo',

    execute: async ({ args, kernel, env, userManager, flagValues, ...context }) => {

        if (args.length === 0) return 'usage: sudo <command> [arguments]';

        const currentUser = env.get('USER') || 'guest';

        const groups = userManager.getGroups();
        const sudoGroup = groups.find(g => g.groupName === 'sudo' || g.groupName === 'wheel');
        const isSudoer = sudoGroup?.members.includes(currentUser);

        if (currentUser !== 'root' && !isSudoer) {
            return `Sorry, user ${currentUser} is not allowed to execute sudo. This incident will be reported.`;
        }

        // Detectar si la bandera llegó mapeada o si sigue pegada a los args
let passwordProvided: string | null = flagValues['--sudo-pass'] || flagValues['sudo-pass'] || null;

// 🌟 SOLUCIÓN KERNEL: Si el mapa de flags falló, la extraemos por Regex del string crudo
if (!passwordProvided && (context as any).rawInput) {
    const match = (context as any).rawInput.match(/--sudo-pass=(\S+)/);
    if (match) {
        passwordProvided = match[1];
    }
}

        if (currentUser !== 'root' && !passwordProvided) {
            return `AUTH_REQUIRED:sudo:${currentUser}`;
        }

        if (currentUser !== 'root' && passwordProvided) {
            const userEntity = userManager.getUserByName(currentUser);
            const inputHash = userManager.hashPassword(passwordProvided);

            if (!userEntity || inputHash !== userEntity.password) {
                return 'sudo: 1 incorrect password attempt';
            }
        }

        // Limpieza quirúrgica de argumentos para el comando hijo
        const cleanArgs = args.filter(arg => !arg.startsWith('--sudo-pass='));
        const commandLineToExecute = cleanArgs.join(' ');
        
        const originalUser = currentUser;
        try {
            env.set('USER', 'root');
            env.set('SUDO_USER', originalUser);
            
            const subResult = await kernel.execute(commandLineToExecute, true);
            
            return subResult;

        } catch (error: any) {
            return `sudo: error executing command: ${error.message}`;
        } finally {
            env.set('USER', originalUser);
            env.set('SUDO_USER', '');
        }
    },
};