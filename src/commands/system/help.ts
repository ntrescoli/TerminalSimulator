import { ICommand } from '../../types/types';

export const Help: ICommand = {
    name: 'help',
    execute: ({ args }) => {
        // En una fase posterior, podríamos pasar la lista de comandos al contexto
        // Por ahora, una ayuda genérica
        return "Comandos disponibles: ls, cd, cat, echo, whoami, clear, help, mkdir, pwd";
    }
};