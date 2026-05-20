import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const DateCommand: ICommand = {
    name: 'date',
    // description: 'Muestra la fecha y hora del sistema',
    execute: async ({ args, hasFlag }) => {
        const now = new Date();

        // Soporte para UTC
        if (hasFlag('-u') || hasFlag('--utc')) {
            return now.toUTCString();
        }

        // Soporte para formato personalizado (ej: date +%H:%M)
        // Por ahora, si empieza con '+', devolvemos un formato amable
        // (Podrías expandir esto con un switch para parsear %Y, %m, %d, etc.)
        const customFormat = args.find(arg => arg.startsWith('+'));
        if (customFormat) {
            return formatCustomDate(now, customFormat.slice(1));
        }

        // Formato por defecto: dom may 10 15:30:45 CEST 2026
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'short',
        };

        const dateStr = now.toLocaleString('es-ES', options).replace(/,/g, '');
        const year = now.getFullYear();

        return `${dateStr} ${year}`;
    },
};

/**
 * Helper sencillo para parsear formatos básicos si el usuario usa '+'
 */
function formatCustomDate(date: Date, format: string): string {
    const map: { [key: string]: any } = {
        '%Y': date.getFullYear(),
        '%m': (date.getMonth() + 1).toString().padStart(2, '0'),
        '%d': date.getDate().toString().padStart(2, '0'),
        '%H': date.getHours().toString().padStart(2, '0'),
        '%M': date.getMinutes().toString().padStart(2, '0'),
        '%S': date.getSeconds().toString().padStart(2, '0'),
    };

    let result = format;
    for (const key in map) {
        result = result.replace(new RegExp(key, 'g'), map[key]);
    }
    return result;
}