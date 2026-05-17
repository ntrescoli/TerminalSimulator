import { ICommand } from '../../../../kernel/domain/entities/Command';

export const History: ICommand = {
    name: 'history',
    execute: ({ kernel, hasFlag }) => {
        const history = kernel.getHistory();

        if (hasFlag('-c')) {
            kernel.clearHistory();
            return "";
        }

        // Si el usuario quiere extraerlo (exportar)
        if (hasFlag('-e') || hasFlag('--export')) {
            const content = history.join('\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'bash_history.txt';
            link.click();
            
            URL.revokeObjectURL(url);
            return "Historial extraído y descargado como bash_history.txt";
        }

        // Listado normal con índices (como en bash real)
        return history
            .map((cmd: string, index: number) => `${(index + 1).toString().padStart(5)}  ${cmd}`)
            .join('\n');
    }
};