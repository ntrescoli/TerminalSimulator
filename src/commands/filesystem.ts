import { ICommand } from '../core/types';

export const Ls: ICommand = {
    name: 'ls',
    execute: ({ args, hasFlag, fs }) => {
        const showHidden = hasFlag('-a');
        const isDetailed = hasFlag('-l');
        const path = args[0] || '.';

        if (isDetailed) {
            return fs.lsDetailed(path, showHidden).join('\n');
        }
        return fs.ls(path, showHidden).join('  ');
    }
};

export const Cat: ICommand = {
    name: 'cat',
    execute: ({ args, fs }) => {
        const filename = args[0];
        if (!filename) return "cat: missing file operand";

        try {
            const content = fs.cat(filename);
            // Si fs.cat devuelve null o undefined cuando no existe:
            if (content === null || content === undefined) {
                return `cat: ${filename}: No such file or directory`;
            }
            return content;
        } catch (error) {
            return `cat: ${filename}: Error reading file`;
        }
    }
};

export const Cd: ICommand = {
    name: 'cd',
    execute: ({ args, fs, env }) => {
        const path = args[0] || '~';
        const error = fs.changeDirectory(path);

        if (error) return error; // "cd: no such directory", etc.

        env.set('PWD', fs.getPresentWorkingDirectory());
        return "";
    }
};

export const Pwd: ICommand = {
    name: 'pwd',
    execute: ({ fs }) => fs.getPresentWorkingDirectory()
};

export const Touch: ICommand = {
    name: 'touch',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "touch: missing file operand";

        const path = args[0];
        const content = args[1] || "";

        // Capturamos el error de permisos o de ruta
        const error = fs.touch(path, content);

        if (error) return error;
        return "";
    }
};

export const Mkdir: ICommand = {
    name: 'mkdir',
    execute: ({ args, fs }) => {
        if (args.length < 1) return "mkdir: missing operand";

        // Capturamos lo que devuelve el FileSystem
        const error = fs.mkdir(args[0]);

        // Si hay un error (es un string), lo devolvemos a la terminal
        if (error) return error;

        // Si es null, devolvemos string vacío (todo ok)
        return "";
    }
};

export const Grep: ICommand = {
    name: 'grep',
    execute: ({ args, hasFlag, fs, pipeInput }) => {
        const pattern = args[0];
        const filePath = args[1];

        if (!pattern) return "usage: grep [pattern]";

        // Prioridad: 1. El input del Pipe | 2. El contenido del archivo
        let content = "";
        if (pipeInput) {
            content = pipeInput;
        } else if (filePath) {
            content = fs.cat(filePath);
        } else {
            return "grep: missing input (file or pipe)";
        }

        if (content.startsWith('cat:')) return content;

        const regex = new RegExp(pattern, hasFlag('-i') ? 'i' : '');
        return content.split('\n')
            .filter(line => regex.test(line))
            .join('\n');
    }
};

export const Chmod: ICommand = {
    name: 'chmod',
    execute: ({ args, options, fs }) => {
        // 1. Combinamos todo para buscar el modo (+r, -w, etc)
        const allParams = [...options, ...args];
        
        // 2. Buscamos el parámetro que contiene la operación
        const mode = allParams.find(p => p.startsWith('+') || p.startsWith('-'));
        // 3. El path suele ser el primer argumento que no es el modo
        const path = args.find(a => a !== mode);

        if (!mode || !path) {
            return "usage: chmod [+/-][rwx] [file]";
        }

        const node = (fs as any).resolvePath(path);
        if (!node) return `chmod: cannot access '${path}': No such file or directory`;

        const operation = mode[0];    // '+' o '-'
        const permission = mode[1];   // 'r', 'w' o 'x'
        const value = (operation === '+');

        // Validamos que el permiso sea válido
        if (!['r', 'w', 'x'].includes(permission)) {
            return `chmod: invalid permission mode: ${permission}`;
        }

        // Aplicamos el cambio al nodo
        if (permission === 'r') node.permissions.read = value;
        if (permission === 'w') node.permissions.write = value;
        if (permission === 'x') node.permissions.execute = value;

        return ""; 
    }
};