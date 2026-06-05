import { Kernel } from './kernel/Kernel';
import { TerminalUI } from './ui/Terminal';
import { AuthenticationManager } from './ui/AuthenticationManager';
import { CommandHistoryExpander } from './ui/CommandHistoryExpander';
import { CommandHistoryNavigator } from './ui/CommandHistoryNavigator';
import { TerminalInputHandler } from './ui/TerminalInputHandler';

export class TSTerminal {
    private kernel: Kernel;
    private terminalUI!: TerminalUI;

    constructor(container: HTMLElement, configUrl?: string) {
        this.kernel = new Kernel(configUrl); 
        this.renderStructure(container);
    }

    // 1. Inyectamos dinámicamente tu estructura de index.html
    private renderStructure(container: HTMLElement) {
        container.innerHTML = `
            <div id="terminal-container">
                <div id="output">Cargando sistema...</div>
                <div class="input-line">
                    <span id="prompt" class="prompt"></span>
                    <input type="text" id="terminal-input" autofocus spellcheck="false" autocomplete="off">
                </div>
            </div>
        `;

        // 2. Buscamos los elementos LOCALMENTE dentro del contenedor recibido
        const outputElement = container.querySelector('#output') as HTMLElement;
        const inputElement = container.querySelector('#terminal-input') as HTMLInputElement;
        const promptElement = container.querySelector('#prompt') as HTMLElement;

        // 3. Ejecutamos tu lógica de arranque original
        this.bootstrap(outputElement, inputElement, promptElement);
    }

    private async bootstrap(
        outputElement: HTMLElement, 
        inputElement: HTMLInputElement, 
        promptElement: HTMLElement
    ) {
        await this.kernel.boot();

        this.terminalUI = new TerminalUI(outputElement, inputElement, promptElement);
        this.terminalUI.clear();

        const authManager = new AuthenticationManager();
        const historyExpander = new CommandHistoryExpander();
        const historyNavigator = new CommandHistoryNavigator(this.kernel.getHistory());
        const inputHandler = new TerminalInputHandler(
            this.kernel, 
            this.terminalUI, 
            authManager, 
            historyExpander, 
            historyNavigator
        );
        
        inputHandler.attach(inputElement);

        // Mensajes de bienvenida
        this.terminalUI.print('Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)');
        this.terminalUI.print(`System information as of ${new Date().toUTCString()}`);
        this.terminalUI.print('');

        this.terminalUI.updatePrompt(this.kernel.getPromptText());
        inputElement.focus();
    }
}