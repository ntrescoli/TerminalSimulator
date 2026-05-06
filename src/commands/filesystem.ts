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
        
        if (error) return error;

        // Sincronizamos el PWD del entorno con la realidad del FileSystem
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
        // Si hay un segundo argumento (lo que estaba entre comillas), es el contenido
        const content = args[1] || ""; 

        fs.writeFile(path, content);
        return "";
    }
};

export const Mkdir: ICommand = {
    name: 'mkdir',
    execute: ({ args, fs }) => {
        if (!args[0]) return "mkdir: missing operand";
        fs.mkdir(args[0]);
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