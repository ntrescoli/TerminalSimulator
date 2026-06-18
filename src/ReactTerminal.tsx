import React, { useEffect, useRef } from "react";
import { TSTerminal } from "./TSTerminal";
import type { Kernel } from "./kernel/Kernel";
// @ts-ignore
import "./style.css"; // React importará tus estilos globales de la terminal

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
  existingKernel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<TSTerminal | null>(null);

  // EFECTO 1: Inicialización
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    try {
      const terminal = new TSTerminal(containerRef.current, existingKernel);
      terminalRef.current = terminal;

      terminal
        .boot(configUrl)
        .then(() => {
          // Sincronizamos solo si la instancia sigue viva
          if (terminalRef.current) {
            syncPowerState(terminalRef.current, isPowered);
          }
        })
        .catch((error) => {
          console.error("Error durante el boot de TSTerminal:", error);
        });
    } catch (error) {
      console.error("Error inicializando ReactTerminal:", error);
    }

    return () => {
      if (terminalRef.current) {
        terminalRef.current.detach();
        terminalRef.current = null;
      }
    };
  }, [configUrl, existingKernel]);

  // EFECTO 2: Sincronización en caliente de la Prop de energía
  useEffect(() => {
    // ⚠️ SEGURIDAD: Solo actuamos si la terminal ya pasó por el constructor y está guardada en la referencia
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
        width: "100%",
        height: "100%",
        minHeight: "400px",
      }}
    />
  );
};
