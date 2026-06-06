export declare class TerminalUI {
    private readonly outputElement;
    private readonly inputElement;
    private readonly promptElement;
    constructor(output: HTMLElement, input: HTMLInputElement, prompt: HTMLElement);
    private init;
    /**
     * Imprime una línea en la terminal
     */
    print(text: string, className?: string): void;
    /**
     * Copia lo que el usuario escribió al historial antes de procesarlo
     */
    copyInputToOutput(command: string): void;
    /**
     * Actualiza el texto del prompt (ej: al cambiar de usuario o carpeta)
     */
    updatePrompt(text: string): void;
    /**
     * Hace scroll automático hacia abajo
     */
    scrollToBottom(): void;
    /**
     * Limpia la pantalla (para el comando 'clear')
     */
    clear(): void;
    /**
     * Cambia el tipo de input (text o password) dinámicamente
     */
    setInputType(type: 'text' | 'password'): void;
}
//# sourceMappingURL=Terminal.d.ts.map