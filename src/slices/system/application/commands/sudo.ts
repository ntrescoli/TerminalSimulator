import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Sudo: ICommand = {
    name: 'sudo',

    execute: async ({ args, kernel, env, userManager, flagValues, ...context }) => {
        console.log("🪵 [SUDO 1] Entrando a comando Sudo.");
        console.log("🪵 [SUDO 1.1] Argumentos recibidos (args):", args);
        console.log("🪵 [SUDO 1.2] Banderas parseadas por Kernel (flagValues):", flagValues);
        console.log("🪵 [SUDO 1.3] Entrada cruda en contexto (rawInput):", (context as any).rawInput);

        if (args.length === 0) return "usage: sudo <command> [arguments]";

        const currentUser = env.get('USER') || 'guest';
        console.log("🪵 [SUDO 2] Usuario ejecutando sudo actualmente:", currentUser);

        const groups = userManager.getGroups();
        const sudoGroup = groups.find(g => g.groupName === 'sudo' || g.groupName === 'wheel');
        const isSudoer = sudoGroup?.members.includes(currentUser);

        if (currentUser !== 'root' && !isSudoer) {
            console.log("❌ [SUDO ERR] El usuario no pertenece al grupo sudoers.");
            return `Sorry, user ${currentUser} is not allowed to execute sudo. This incident will be reported.`;
        }

        // Detectar si la bandera llegó mapeada o si sigue pegada a los args
let passwordProvided: string | null = flagValues['--sudo-pass'] || flagValues['sudo-pass'] || null;

// 🌟 SOLUCIÓN KERNEL: Si el mapa de flags falló, la extraemos por Regex del string crudo
if (!passwordProvided && (context as any).rawInput) {
    const match = (context as any).rawInput.match(/--sudo-pass=(\S+)/);
    if (match) {
        passwordProvided = match[1];
        console.log("🪵 [SUDO SOLUCIÓN] Password extraída con éxito de rawInput:", passwordProvided);
    }
}

        console.log("🪵 [SUDO 3] Contraseña provista detectada:", passwordProvided ? "SÍ (Enmascarada)" : "NO (null)");

        if (currentUser !== 'root' && !passwordProvided) {
            console.log("🪵 [SUDO 3.1] Lanzando AUTH_REQUIRED de primera vuelta.");
            return `AUTH_REQUIRED:sudo:${currentUser}`;
        }

        if (currentUser !== 'root' && passwordProvided) {
            const userEntity = userManager.getUserByName(currentUser);
            const inputHash = userManager.hashPassword(passwordProvided);

            console.log("🪵 [SUDO 4] Validando hashes de autenticación:", {
                usuario: currentUser,
                hashAlmacenado: userEntity?.password,
                hashCalculado: inputHash
            });

            if (!userEntity || inputHash !== userEntity.password) {
                console.log("❌ [SUDO ERR] Contraseña incorrecta.");
                return "sudo: 1 incorrect password attempt";
            }
            console.log("✅ [SUDO 4.1] Autenticación de contraseña exitosa.");
        }

        // Limpieza quirúrgica de argumentos para el comando hijo
        const cleanArgs = args.filter(arg => !arg.startsWith('--sudo-pass='));
        const commandLineToExecute = cleanArgs.join(' ');
        
        console.log("LOG REVELADOR 🪵 [SUDO 5] Comando final que se va a enviar al hijo:", `"${commandLineToExecute}"`);

        const originalUser = currentUser;
        try {
            env.set('USER', 'root');
            env.set('SUDO_USER', originalUser);
            
            console.log("🪵 [SUDO 6] Ejecutando subcomando recursivo en el Kernel...");
            const subResult = await kernel.execute(commandLineToExecute, true);
            
            console.log("🪵 [SUDO 7] Resultado devuelto por el subcomando hijo:", `"${subResult}"`);
            return subResult;

        } catch (error: any) {
            console.error("❌ [SUDO CATCH] Error en try/catch execution:", error);
            return `sudo: error executing command: ${error.message}`;
        } finally {
            env.set('USER', originalUser);
            env.set('SUDO_USER', '');
            console.log("残留 [SUDO END] Entorno restaurado al usuario original:", env.get('USER'));
        }
    }
};