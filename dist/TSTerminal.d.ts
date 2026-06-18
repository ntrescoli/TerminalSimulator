import { Kernel } from './kernel/Kernel';
export declare class TSTerminal {
    kernel: Kernel;
    private terminalUI;
    private container;
    private inputHandler;
    private terminalEl;
    constructor(container: HTMLElement, existingKernel?: Kernel);
    boot(configUrl?: string): Promise<void>;
    private renderStructure;
    private bootstrap;
    private showWelcomeMessage;
    /**
     * Apaga la terminal y limpia la pantalla desde código externo.
     */
    turnOff(): void;
    /**
     * Enciende la terminal y restaura el prompt desde código externo.
     */
    turnOn(): void;
    /**
     * Sincroniza el estado visual del Input y el Prompt según la energía actual del Kernel
     */
    applyPowerStateVisuals(): void;
    private focusInput;
    detach(): Kernel;
}
//# sourceMappingURL=TSTerminal.d.ts.map