import { Kernel } from './kernel/Kernel';
import { TerminalUI } from './ui/Terminal';
import { AuthenticationManager } from './ui/AuthenticationManager';
import { CommandHistoryExpander } from './ui/CommandHistoryExpander';
import { CommandHistoryNavigator } from './ui/CommandHistoryNavigator';
import { TerminalInputHandler } from './ui/TerminalInputHandler';

export class TSTerminal {
    public kernel: Kernel; 
    private terminalUI!: TerminalUI;
    private container: HTMLElement;
    private inputHandler!: TerminalInputHandler;
    private terminalEl!: HTMLElement;

    constructor(container: HTMLElement, existingKernel?: Kernel) {
        this.container = container;
        this.kernel = existingKernel || new Kernel();
    }

    public async boot(configUrl?: string): Promise<void> {
        await this.kernel.boot(configUrl);

        // Si ya está renderizada en el DOM, la volvemos a mostrar (cambio de pestaña)
        if (this.terminalEl) {
            this.terminalEl.style.display = 'block';
            this.focusInput();
            return;
        }

        // Primera vez que se monta en el hipervisor
        this.renderStructure();
    }

    private renderStructure() {
        this.terminalEl = document.createElement('div');
        this.terminalEl.className = 'terminal-instance-wrapper ubuntu-terminal-theme';
        this.terminalEl.style.width = '100%';
        this.terminalEl.style.height = '100%';

        // Estructura HTML usando exactamente las clases de tu nuevo style.css
        this.terminalEl.innerHTML = `
            <div class="terminal-container">
                <div class="terminal-output">Cargando sistema...</div>
                <div class="input-line">
                    <span class="prompt"></span>
                    <input type="text" class="terminal-input" autofocus spellcheck="false" autocomplete="off">
                </div>
            </div>
        `;

        this.container.appendChild(this.terminalEl);

        // REVISIÓN CRÍTICA: Buscamos usando los selectores de clase exactos (.)
        const outputElement = this.terminalEl.querySelector('.terminal-output') as HTMLElement;
        const inputElement = this.terminalEl.querySelector('.terminal-input') as HTMLInputElement;
        const promptElement = this.terminalEl.querySelector('.prompt') as HTMLElement;

        // Validamos que los elementos existan en el DOM antes de inicializar la lógica
        if (!outputElement || !inputElement || !promptElement) {
            console.error('Error crítico: No se pudieron encontrar los elementos de la terminal usando las clases CSS.');
            return;
        }

        this.bootstrap(outputElement, inputElement, promptElement);
    }

    private async bootstrap(outputElement: HTMLElement, inputElement: HTMLInputElement, promptElement: HTMLElement) {
        this.terminalUI = new TerminalUI(outputElement, inputElement, promptElement);
        this.terminalUI.clear(); // Esto borra de inmediato el texto de "Cargando sistema..."

        const authManager = new AuthenticationManager();
        const historyExpander = new CommandHistoryExpander();
        const historyNavigator = new CommandHistoryNavigator(this.kernel.getHistory());
        
        this.inputHandler = new TerminalInputHandler(
            this.kernel, 
            this.terminalUI, 
            authManager, 
            historyExpander, 
            historyNavigator
        );
        
        this.inputHandler.attach(inputElement);

        // Si el kernel está apagado, aplicamos el bloqueo
        if (this.kernel.getPowerState && this.kernel.getPowerState() === 'POWER_OFF') {
            this.applyPowerStateVisuals();
            return;
        }

        this.showWelcomeMessage();
    }

    private showWelcomeMessage() {
        const hostname = this.kernel.getEnv ? this.kernel.getEnv('HOSTNAME') : 'ts-linux';
        this.terminalEl.querySelector('.terminal-output')?.classList.add('active-os');
        this.terminalUI.print(`Welcome to the virtual machine [${hostname.toUpperCase()}]`);
        this.terminalUI.print(`System information as of ${new Date().toUTCString()}`);
        this.terminalUI.print('');
        this.terminalUI.updatePrompt(this.kernel.getPromptText());
        this.focusInput();
    }

    /**
     * Apaga la terminal y limpia la pantalla desde código externo.
     */
    public turnOff(): void {
        this.kernel.shutdown();
        this.applyPowerStateVisuals();
    }

    /**
     * Enciende la terminal y restaura el prompt desde código externo.
     */
    public turnOn(): void {
        this.kernel.powerOn();
        this.applyPowerStateVisuals();
    }

    /**
     * Sincroniza el estado visual del Input y el Prompt según la energía actual del Kernel
     */
    public applyPowerStateVisuals() {
        // ⚠️ CRÍTICO: Si el DOM aún no se ha creado en el proceso asíncrono, abortamos de forma segura.
        if (!this.terminalEl) return;
        
        const inputElement = this.terminalEl.querySelector('.terminal-input') as HTMLInputElement;
        const promptElement = this.terminalEl.querySelector('.prompt') as HTMLElement;
        const inputLine = this.terminalEl.querySelector('.input-line') as HTMLElement; // <-- Capturamos la línea completa
        
        if (!inputElement || !promptElement || !inputLine) return;

        if (this.kernel.getPowerState() === 'POWER_OFF') {
            // 1. APAGÓN: Limpiamos por completo la pantalla
            this.terminalUI.clear();
            
            // 2. Ocultamos la línea del prompt e input por completo
            inputLine.style.display = 'none';
            
            // 3. Mostramos el aviso de sistema apagado
            this.terminalUI.print('The terminal is turned off. Press "Power On" in the hypervisor to start.');
            
            // 4. Bloqueamos el input por seguridad
            inputElement.disabled = true;
            inputElement.value = '';
            promptElement.innerText = '';
        } else {
            // 1. ENCENDIDO: Restauramos el layout de la línea de comandos (flex es el valor de tu style.css)
            inputLine.style.display = 'flex';
            inputElement.disabled = false;
            
            // 2. Limpiamos el mensaje de "Apagado"
            this.terminalUI.clear();
            
            // 3. Lanzamos el mensaje oficial de Ubuntu limpio desde arriba
            this.showWelcomeMessage();
        }
    }

    private focusInput() {
        const inputElement = this.terminalEl.querySelector('.terminal-input') as HTMLInputElement;
        if (inputElement && !inputElement.disabled) {
            inputElement.focus();
        }
    }

    public detach(): Kernel {
        if (this.terminalEl) {
            this.terminalEl.style.display = 'none';
        }
        return this.kernel;
    }
}