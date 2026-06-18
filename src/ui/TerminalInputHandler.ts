import type { Kernel } from '../kernel/Kernel';
import type { AuthenticationManager } from './AuthenticationManager';
import type { CommandHistoryExpander } from './CommandHistoryExpander';
import type { CommandHistoryNavigator } from './CommandHistoryNavigator';
import type { TerminalUI } from './Terminal';

export class TerminalInputHandler {
    private currentAbortController: AbortController | null = null;
    
    // GUARDADO DE REFERENCIAS PARA EL HIPERVISOR
    private boundKeyDownListener: ((e: KeyboardEvent) => Promise<void>) | null = null;
    private attachedInputElement: HTMLInputElement | null = null;

    constructor(
        private readonly kernel: Kernel,
        private readonly terminal: TerminalUI,
        private readonly authManager: AuthenticationManager,
        private readonly historyExpander: CommandHistoryExpander,
        private readonly historyNavigator: CommandHistoryNavigator,
    ) {}

    public attach(inputElement: HTMLInputElement): void {
        this.attachedInputElement = inputElement;

        // Guardamos la función con nombre y referencia exacta en la clase
        this.boundKeyDownListener = async (e: KeyboardEvent) => {
            await this.handleKeyDown(e, inputElement);
        };

        // Enganchamos el evento usando la referencia guardada
        inputElement.addEventListener('keydown', this.boundKeyDownListener);
    }

    /**
     * MÉTODO PARA EL HIPERVISOR
     * Desconecta los listeners del input de manera limpia sin alterar el Kernel.
     */
    public detach(): void {
        if (this.attachedInputElement && this.boundKeyDownListener) {
            this.attachedInputElement.removeEventListener('keydown', this.boundKeyDownListener);
        }
        
        this.attachedInputElement = null;
        this.boundKeyDownListener = null;

        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }
    }

    private async handleKeyDown(e: KeyboardEvent, inputElement: HTMLInputElement): Promise<void> {
        // Bloqueo preventivo: Si la máquina está apagada en el hipervisor, ignoramos el teclado
        if (this.kernel.getPowerState && this.kernel.getPowerState() === 'POWER_OFF') {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();

            if (this.currentAbortController && !this.currentAbortController.signal.aborted) {
                this.currentAbortController.abort();
                this.currentAbortController = null;
                this.terminal.print('^C');
                this.terminal.updatePrompt(this.kernel.getPromptText());
                inputElement.value = '';
                return;
            }

            if (inputElement.value.length > 0) {
                this.terminal.print('^C');
                inputElement.value = '';
            }
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            await this.handleEnter(inputElement);
            return;
        }

        if (e.key === 'ArrowUp') {
            if (!this.authManager.hasPendingAuth()) {
                e.preventDefault();
                inputElement.value = this.historyNavigator.goUp();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            if (!this.authManager.hasPendingAuth()) {
                e.preventDefault();
                inputElement.value = this.historyNavigator.goDown();
            }
            return;
        }

        if (e.key === 'Tab') {
            if (this.authManager.hasPendingAuth()) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            const currentValue = inputElement.value;
            const completions = this.kernel.getCompletions(currentValue);

            if (completions.length === 1) {
                const lastSpaceIndex = currentValue.lastIndexOf(' ');
                const prefix = currentValue.substring(0, lastSpaceIndex + 1);
                inputElement.value = prefix + completions[0];
            } else if (completions.length > 1) {
                const suggestions = completions.map(c => {
                    const parts = c.split('/');
                    return c.endsWith('/') ? parts[parts.length - 2] + '/' : parts[parts.length - 1];
                });
                
                // Imprime las sugerencias respetando el flujo de clases
                this.terminal.print('\n' + suggestions.join('   '));
                this.terminal.updatePrompt(this.kernel.getPromptText());
            }
        }
    }

    private async handleEnter(inputElement: HTMLInputElement): Promise<void> {
        const abortController = new AbortController();
        this.currentAbortController = abortController;

        try {
            const rawValue = inputElement.value;
            let command = rawValue.trim();
            const hadAuthPending = this.authManager.hasPendingAuth();

            if (command === '' && !hadAuthPending) {
                this.terminal.updatePrompt(this.kernel.getPromptText());
                inputElement.value = '';
                return;
            }

            if (hadAuthPending) {
                this.terminal.copyInputToOutput('********');
                const fullCommand = this.authManager.buildAuthenticatedCommand(command);
                this.authManager.clearPendingAuth();
                this.terminal.setInputType('text');
                const response = await this.kernel.execute(fullCommand, true, abortController.signal);

                if (response.startsWith('AUTH_REQUIRED:')) {
                    const [, commandName, targetUser] = response.split(':');
                    this.authManager.initiatePendingAuth(commandName, command);
                    this.terminal.updatePrompt(this.authManager.getPromptText(targetUser));
                    this.terminal.setInputType('password');
                    inputElement.value = '';
                    return;
                }

                this.processResponse(response);
                inputElement.value = '';
                this.historyNavigator.reset();
                return;
            }

            const expanded = this.historyExpander.expand(command, this.kernel.getHistory());
            if (expanded) {
                command = expanded;
                this.terminal.print(command);
            }

            this.terminal.copyInputToOutput(command);
            const response = await this.kernel.execute(command, false, abortController.signal);

            if (response.startsWith('AUTH_REQUIRED:')) {
                const [, commandName, targetUser] = response.split(':');
                this.authManager.initiatePendingAuth(commandName, command);
                this.terminal.updatePrompt(this.authManager.getPromptText(targetUser));
                this.terminal.setInputType('password');
                inputElement.value = '';
                return;
            }

            this.processResponse(response);
            inputElement.value = '';
            this.historyNavigator.reset();
        } 
        finally {
            this.currentAbortController = null;
        }
    }

    private processResponse(response: string): void {
        if (response === 'COMMAND_CLEAR') {
            this.terminal.clear();
        } else if (response !== '') {
            this.terminal.print(response);
        }
        this.terminal.updatePrompt(this.kernel.getPromptText());
        this.terminal.scrollToBottom();
    }
}