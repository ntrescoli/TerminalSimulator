// TSTerminal como Componente React
import { useEffect, useRef } from 'react';
import { TSTerminal } from './TSTerminal';
// @ts-ignore
import './style.css'; // React importará tus estilos globales de la terminal

/**
 * ReactTerminal Component
 * 
 * Componente React que envuelve TSTerminal.
 * 
 * Uso:
 * ```tsx
 * import { ReactTerminal } from 'terminal-simulator';
 * import 'terminal-simulator/style.css';
 * 
 * export function App() {
 *   return <ReactTerminal />;
 * }
 * ```
 * 
 * IMPORTANTE:
 * - Asegúrate de instalar react y react-dom
 * - Importa los estilos CSS
 * - Usa archivo .tsx para JSX
 */
export const ReactTerminal = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<TSTerminal | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Limpiar instancia anterior si existe
        if (terminalRef.current) {
            // TSTerminal no tiene un método destroy, pero limpiamos la referencia
            terminalRef.current = null;
        }

        try {
            // Crear nueva instancia de TSTerminal
            terminalRef.current = new TSTerminal(containerRef.current);
        } catch (error) {
            console.error('Error initializing ReactTerminal:', error);
        }

        // Cleanup en desmontaje
        return () => {
            if (terminalRef.current) {
                terminalRef.current = null;
            }
        };
    }, []); // Array vacío para que solo se ejecute una vez al montar

    return (
        <div 
            ref={containerRef} 
            className="ubuntu-terminal-theme"
            style={{
                width: '100%',
                height: '100%',
                minHeight: '400px', // Altura mínima para que sea usable
            }}
        />
    );
};