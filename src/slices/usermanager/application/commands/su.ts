import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Su: ICommand = {
    name: 'su',

    execute: async ({ args, env, userManager }) => {
        const currentUser = env.get('USER') || 'guest';
        const targetName = args[0] || 'root';
        const user = userManager.getUserByName(targetName);

        if (!user) return `su: user '${targetName}' does not exist`;

        // 1. Regla de Linux: root no necesita contraseña
        if (currentUser === 'root') {
            env.set('USER', user.username);
            env.set('HOME', user.home);
            env.set('PWD', user.home);
            return `Cambiando al usuario ${user.username}...`;
        }

        // 🌟 NUEVA REGLA: Si la cuenta destino no tiene contraseña (caso de useradd nico)
        // Un usuario común no puede autenticarse porque la cuenta está bloqueada de inicio.
        if (!user.password || user.password.trim() === "" || user.password.startsWith('!')) {
            return "su: Authentication failure (Account is locked. Use passwd to set a password first).";
        }

        // 2. Comprobar si ya nos enviaron la contraseña desde el Frontend (Segunda vuelta)
        const passwordProvided = args[1];
        if (!passwordProvided) {
            return `AUTH_REQUIRED:su:${targetName}`;
        }

        // 3. Validar hash usando el método nativo de tu UserManagerService
        const inputHash = userManager.hashPassword(passwordProvided);

        if (inputHash !== user.password) {
            return "su: Authentication failure";
        }

        // 4. Éxito
        env.set('USER', user.username);
        env.set('HOME', user.home);
        env.set('PWD', user.home);

        return `Cambiando al usuario ${user.username}...`;
    }
};