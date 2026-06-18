import { default as React } from 'react';
import { Kernel } from './kernel/Kernel';
interface ReactTerminalProps {
    /** URL opcional para el JSON de configuración de la máquina virtual (por ejemplo, '/vms/mi-config.json') */
    configUrl?: string;
    /** Controla si la máquina arranca encendida o apagada de forma declarativa (por defecto true) */
    isPowered?: boolean;
    /** Permite inyectar una instancia de Kernel ya existente (ideal para el hipervisor o clústeres) */
    existingKernel?: Kernel;
}
/**
 * ReactTerminal Component
 * Componente React que envuelve TSTerminal de forma segura y reactiva.
 */
export declare const ReactTerminal: React.FC<ReactTerminalProps>;
export {};
//# sourceMappingURL=ReactTerminal.d.ts.map