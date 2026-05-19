import { Kernel } from '../kernel/Kernel';
import { AuthenticationManager } from './AuthenticationManager';
import { CommandHistoryExpander } from './CommandHistoryExpander';
import { CommandHistoryNavigator } from './CommandHistoryNavigator';
import { TerminalUI } from './Terminal';

export class TerminalInputHandler {
    constructor(
        private kernel: Kernel,
        private terminal: TerminalUI,
        private authManager: AuthenticationManager,
        private historyExpander: CommandHistoryExpander,
        private historyNavigator: CommandHistoryNavigator
    ) {}

    public attach(inputElement: HTMLInputElement): void {
        inputElement.addEventListener('keydown', async (e: KeyboardEvent) => {
            await this.handleKeyDown(e, inputElement);
        });
    }

    private async handleKeyDown(e: KeyboardEvent, inputElement: HTMLInputElement): Promise<void> {
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
                this.terminal.print('\n' + suggestions.join('  '));
                this.terminal.updatePrompt(this.kernel.getPromptText());
            }
        }
    }

    private async handleEnter(inputElement: HTMLInputElement): Promise<void> {
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
            const response = await this.kernel.execute(fullCommand, true);

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
        const response = await this.kernel.execute(command);

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
