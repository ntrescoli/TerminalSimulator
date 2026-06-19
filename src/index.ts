// Punto de entrada del paquete NPM
import './style.css';

export { TSTerminal } from './TSTerminal'; // Para proyectos Vanilla/JS
export { ReactTerminal } from './ReactTerminal'; // Para proyectos React
export { Kernel } from './kernel/Kernel'; // Acceso directo al kernel
export type { } from './kernel/Kernel'; // Exportar tipos del kernel si es necesario