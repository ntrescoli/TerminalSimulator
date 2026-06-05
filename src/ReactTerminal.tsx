// TSTerminal como Componente React

import { useEffect, useRef } from 'react';
import { TSTerminal } from './TSTerminal';
import './style.css'; // React importará tus estilos globales de la terminal

export const ReactTerminal = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            // Pasamos el div controlado por React a tu clase constructora
            new TSTerminal(containerRef.current);
        }
    }, []); // Array vacío para que solo se ejecute una vez al montar

    return <div ref={containerRef} className="ubuntu-terminal-theme" />;
};