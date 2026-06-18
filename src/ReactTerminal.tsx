import React, { useEffect, useRef } from 'react';
import { TSTerminal } from './TSTerminal';
import type { Kernel } from './kernel/Kernel';
// @ts-ignore
import './style.css'; // React importará tus estilos globales de la terminal

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
export const ReactTerminal: React.FC<ReactTerminalProps> = ({ 
    configUrl, 
    isPowered = true, 
    existingKernel 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<TSTerminal | null>(null);

    // EFECTO 1: Ciclo de vida principal (Montaje y desmontaje del core de la terminal)
    useEffect(() => {
        if (!containerRef.current) return;

        // Limpiamos el HTML interno para evitar renderizados duplicados por el StrictMode en desarrollo
        containerRef.current.innerHTML = '';

        try {
            // 1. Instanciamos la clase pasándole el contenedor y el kernel existente si lo hay
            const terminal = new TSTerminal(containerRef.current, existingKernel);
            terminalRef.current = terminal;

            // 2. Ejecutamos la inicialización asíncrona
            terminal.boot(configUrl).then(() => {
                // Una vez que ha hecho boot, forzamos que sincronice el estado de energía inicial de la prop
                if (terminalRef.current) {
                    syncPowerState(terminalRef.current, isPowered);
                }
            }).catch((error) => {
                console.error('Error durante el boot de TSTerminal:', error);
            });

        } catch (error) {
            console.error('Error inicializando ReactTerminal:', error);
        }

        // Cleanup en desmontaje
        return () => {
            if (terminalRef.current) {
                // Desconectamos limpiamente los listeners del input para evitar fugas de memoria
                terminalRef.current.detach();
                terminalRef.current = null;
            }
        };
    }, [configUrl, existingKernel]); // Se re-inicializa de forma segura si cambia la config o el Kernel inyectado

    // EFECTO 2: Sincronización en caliente del estado de energía (isPowered)
    useEffect(() => {
        if (terminalRef.current) {
            syncPowerState(terminalRef.current, isPowered);
        }
    }, [isPowered]);

    /**
     * Función interna de ayuda para no duplicar lógica de energía
     */
    const syncPowerState = (terminal: TSTerminal, powered: boolean) => {
        if (powered) {
            terminal.turnOn();
        } else {
            terminal.turnOff();
        }
    };

    return (
        <div 
            ref={containerRef} 
            className="ubuntu-terminal-theme"
            style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
            }}
        />
    );
};