import { ICommand } from '../core/types';

export const Clear: ICommand = {
    name: 'clear',
    execute: () => 'COMMAND_CLEAR'
};

export const Whoami: ICommand = {
    name: 'whoami',
    execute: ({ env }) => env.get('USER') || 'unknown'
};

export const Echo: ICommand = {
    name: 'echo',
    execute: ({ args, env }) => {
        return args.map(arg => {
            if (arg.startsWith('$')) {
                const varName = arg.substring(1);
                return env.get(varName) || '';
            }
            return arg;
        }).join(' ');
    }
};

export const Help: ICommand = {
    name: 'help',
    execute: ({ args }) => {
        // En una fase posterior, podríamos pasar la lista de comandos al contexto
        // Por ahora, una ayuda genérica
        return "Comandos disponibles: ls, cd, cat, echo, whoami, clear, help, mkdir, pwd";
    }
};

export const Env: ICommand = {
    name: 'env',
    execute: ({ env }) => {
        const allVars = env.getAll();
        return Object.entries(allVars)
            .map(([key, val]) => `${key}=${val}`)
            .join('\n');
    }
};