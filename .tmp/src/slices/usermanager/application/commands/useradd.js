"use strict";
// import { ICommand } from '../../../../kernel/domain/entities/Command';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAdd = void 0;
exports.UserAdd = {
    name: 'useradd',
    valuedFlags: ['u', 's'],
    execute: async ({ args, flagValues, userManager, fs, env }) => {
        // 1. Validaciones de privilegios
        if (env.get('USER') !== 'root') {
            return "useradd: Only root can do that";
        }
        if (args.length < 1) {
            return "useradd: missing username";
        }
        const username = args[0];
        // 2. Gestión de IDs y existencia
        const allUsers = userManager.getUsers();
        if (allUsers.some(u => u.username === username)) {
            return `useradd: user '${username}' already exists`;
        }
        let nextId;
        if (flagValues['-u'] || flagValues['--u']) {
            nextId = parseInt(flagValues['-u'] || flagValues['--u']);
            if (isNaN(nextId))
                return "useradd: invalid numeric argument for -u";
            if (allUsers.some(u => u.uid === nextId)) {
                return `useradd: UID ${nextId} already exists`;
            }
        }
        else {
            nextId = allUsers.length > 0
                ? Math.max(...allUsers.map(u => u.uid)) + 1
                : 1000;
        }
        // 3. Preparación del objeto Usuario con contraseña bloqueada '!' (Estilo Unix)
        // Esto previene logins hasta que el administrador use 'passwd [usuario]'
        const newUser = {
            username,
            uid: nextId,
            gid: nextId,
            home: `/home/${username}`,
            shell: flagValues['-s'] || flagValues['--s'] || '/bin/bash',
            fullName: username,
            password: '!' // 🌟 Cuenta bloqueada por defecto hasta asignación manual
        };
        // 4. Delegación al Servicio
        const error = userManager.saveUser(newUser);
        if (error)
            return error;
        const shellInfo = (flagValues['-s'] || flagValues['--s']) ? ` with shell ${newUser.shell}` : "";
        return `useradd: user '${username}' added (UID: ${nextId})${shellInfo}\nNotice: Account is locked until a password is set via 'passwd'.`;
    }
};
