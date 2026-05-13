import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Who: ICommand = {
    name: 'who',
    // description: 'Muestra quién está conectado',
    execute: async ({ env, kernel }) => {
        const currentUser = env.get('USER') || 'guest';
        const hostname = env.get('HOSTNAME') || 'js-terminal';
        
        // Simulamos la hora de inicio de sesión
        // Usamos la hora de arranque del kernel para que parezca que entró al encenderse
        const bootTime = new Date(Date.now() - kernel.getUptime());
        
        const month = bootTime.toLocaleString('es-ES', { month: 'short' });
        const day = bootTime.getDate();
        const time = bootTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

        // El formato típico de salida: USER TTY DATE TIME (HOST)
        // tty7 es la terminal gráfica, pts/0 son terminales virtuales (ssh/web)
        return `${currentUser.padEnd(10)} pts/0        ${month} ${day} ${time} (${hostname})`;
    }
};

export const W: ICommand = {
    name: 'w',
    // description: 'Muestra quién está conectado',
    execute: async ({ env, kernel }) => {
        const currentUser = env.get('USER') || 'guest';
        const hostname = env.get('HOSTNAME') || 'js-terminal';
        
        // Simulamos la hora de inicio de sesión
        // Usamos la hora de arranque del kernel para que parezca que entró al encenderse
        const bootTime = new Date(Date.now() - kernel.getUptime());
        
        const month = bootTime.toLocaleString('es-ES', { month: 'short' });
        const day = bootTime.getDate();
        const time = bootTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

        // El formato típico de salida: USER TTY DATE TIME (HOST)
        // tty7 es la terminal gráfica, pts/0 son terminales virtuales (ssh/web)
        return `${currentUser.padEnd(10)} pts/0        ${month} ${day} ${time} (${hostname})`;
    }
};