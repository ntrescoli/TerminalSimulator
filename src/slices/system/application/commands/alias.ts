import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Alias: ICommand = {
    name: 'alias',
    valuedFlags: [],

    execute: async ({ args, rawArgs, env, rawInput }) => {
        // Caso 1: Ejecutar 'alias' a secas -> Listar todos
        if (args.length === 0) {
            const allAliases = env.getAliases();
            if (allAliases.length === 0) return "";
            
            return allAliases
                .map(([name, cmd]) => `alias ${name}='${cmd}'`)
                .join('\n');
        }

        // Caso 2: El usuario quiere definir un alias
        // Usamos rawInput (la línea original sin alterar) para extraer exactamente lo que está después del '='
        const equalIndex = rawInput.indexOf('=');

        if (equalIndex === -1) {
            // Si ejecuta 'alias ll' (sin igual), busca si existe y lo muestra
            const nameToCheck = args[0].trim();
            const existing = env.getAlias(nameToCheck);
            if (existing) return `alias ${nameToCheck}='${existing}'`;
            return `shell: alias: ${nameToCheck}: not found`;
        }

        // Extraemos el nombre antes del '=' (ej: de 'alias ll="ls -la"' saca 'alias ll')
        // Quitamos la palabra 'alias ' del inicio y limpiamos espacios
        const namePart = rawInput.substring(0, equalIndex).trim();
        const name = namePart.replace(/^alias\s+/, '').trim();

        // Extraemos el valor literal después del '=' (ej: '"ls -la"')
        let commandValue = rawInput.substring(equalIndex + 1).trim();

        // 🔥 LIMPIEZA ABSOLUTA DE COMILLAS EXTERNAS
        // Si el comando empieza y termina con comillas simples o dobles, se las quitamos limpiamente
        if ((commandValue.startsWith("'") && commandValue.endsWith("'")) || 
            (commandValue.startsWith('"') && commandValue.endsWith('"'))) {
            commandValue = commandValue.substring(1, commandValue.length - 1);
        }

        if (name === "") {
            return "alias: invalid alias name";
        }

        // Guardamos el comando perfectamente limpio en el entorno
        env.setAlias(name, commandValue);
        return ""; 
    }
};