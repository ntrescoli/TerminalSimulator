import { ICommand } from '../../../kernel/domain/entities/Command';

export const Uptime: ICommand = {
    name: 'uptime',
    // description: 'Muestra cuánto tiempo lleva el sistema encendido',
    execute: async ({ kernel, userManager }) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-ES', { hour12: false });
        
        // Calculamos la diferencia
        const uptimeMs = kernel.getUptime();
        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // Formateamos el tiempo de actividad
        let uptimeStr = "";
        if (days > 0) uptimeStr += `${days} day${days > 1 ? 's' : ''}, `;
        if (hours > 0) uptimeStr += `${hours % 24} hour${hours % 24 > 1 ? 's' : ''}, `;
        uptimeStr += `${minutes % 60} min${minutes % 60 > 1 ? 's' : ''}`;

        // Contamos usuarios únicos activos (o registrados en tu caso)
        const userCount = userManager.getUsers().length;

        // Simulamos el Load Average (típico de Linux: 1, 5 y 15 minutos)
        // Como es una simulación, usamos valores bajos y creíbles
        const loadAvg = "0.05, 0.03, 0.01";

        return ` ${timeStr} up ${uptimeStr},  ${userCount} users,  load average: ${loadAvg}`;
    }
};