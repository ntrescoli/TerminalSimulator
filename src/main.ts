import { Kernel } from './kernel/Kernel';
import { TerminalUI } from './ui/Terminal';
import { AuthenticationManager } from './ui/AuthenticationManager';
import { CommandHistoryExpander } from './ui/CommandHistoryExpander';
import { CommandHistoryNavigator } from './ui/CommandHistoryNavigator';
import { TerminalInputHandler } from './ui/TerminalInputHandler';

const bootstrap = async () => {
    const outputElement = document.getElementById('output')!;
    const inputElement = document.getElementById('terminal-input') as HTMLInputElement;
    const promptElement = document.getElementById('prompt')!;

    const kernel = new Kernel();
    outputElement.innerText = 'Cargando sistema...';

    await kernel.boot();

    const terminal = new TerminalUI(outputElement, inputElement, promptElement);
    terminal.clear();

    const authManager = new AuthenticationManager();
    const historyExpander = new CommandHistoryExpander();
    const historyNavigator = new CommandHistoryNavigator(kernel.getHistory());
    const inputHandler = new TerminalInputHandler(kernel, terminal, authManager, historyExpander, historyNavigator);
    inputHandler.attach(inputElement);

    terminal.print('Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)');
    terminal.print(`System information as of ${new Date().toUTCString()}`);
    terminal.print('');

    terminal.updatePrompt(kernel.getPromptText());
    inputElement.focus();
};

bootstrap();
