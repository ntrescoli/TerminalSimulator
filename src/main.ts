import { Kernel } from './kernel/Kernel';
import { TerminalUI } from './ui/Terminal';

const bootstrap = async () => {
    const outputElement = document.getElementById('output')!;
    const inputElement = document.getElementById('terminal-input') as HTMLInputElement;
    const promptElement = document.getElementById('prompt')!;

    const kernel = new Kernel();
    outputElement.innerText = "Cargando sistema...";

    await kernel.boot();

    const terminal = new TerminalUI(outputElement, inputElement, promptElement);
    terminal.clear();

    const commandHistory: string[] = [...kernel.getHistory()];
    let historyIndex = -1;

    // Estado de autenticación interactiva
    let pendingAuth: { type: string; originalLine: string } | null = null;

    const handleCommand = async (value: string) => {
        const command = value.trim();

        // Eco protegido en la terminal
        if (pendingAuth) {
            terminal.copyInputToOutput("********");
        } else {
            terminal.copyInputToOutput(command);
        }

        if (command === '') {
            if (!pendingAuth) terminal.updatePrompt(kernel.getPromptText());
            return;
        }

        let response = "";
        const previousAuthLine = pendingAuth?.originalLine || null;

        // 🌟 CAPTURAMOS EL ESTADO ANTES DE LIMPIARLO
        const eraUnaContrasena = pendingAuth !== null;

        if (pendingAuth) {
            let fullArgs = "";
            if (pendingAuth.type === 'sudo') {
                const cleanRaw = pendingAuth.originalLine.replace(/^sudo\s+/, '');
                fullArgs = `sudo --sudo-pass=${command} ${cleanRaw}`;
            } else {
                fullArgs = `${pendingAuth.originalLine} ${command}`;
            }

            pendingAuth = null;
            terminal.setInputType('text');

            response = await kernel.execute(fullArgs, true);
        } else {
            response = await kernel.execute(command);
        }

        // Si el Kernel vuelve a pedir autenticación (segunda vuelta fallida o nueva petición)
if (response.startsWith("AUTH_REQUIRED:")) {
        const [_, commandName, targetUser] = response.split(":");
        const originalLineToSave = previousAuthLine ? previousAuthLine : command;
        pendingAuth = { type: commandName, originalLine: originalLineToSave };

        // 🌟 LA REPARACIÓN: Guardamos el comando padre en el historial 
        // antes de congelar la terminal para pedir la contraseña
        if (!eraUnaContrasena) {
            commandHistory.push(command);
        }

        const promptText = commandName === 'sudo'
            ? `[sudo] password for ${targetUser}: `
            : "Password: ";

        terminal.updatePrompt(promptText);
        terminal.setInputType('password');
        return; // Ahora el return ya va con los deberes hechos
    }

        if (response === 'COMMAND_CLEAR') {
            terminal.clear();
        } else if (response !== "") {
            terminal.print(response);
        }

        // 🌟 CONTROL DE HISTORIAL ABSOLUTO
        // Guardamos en las flechas el comando original completo (ej: 'sudo cat /etc/shadow')
        // pero JAMÁS la contraseña suelta que se acaba de introducir.
// Ya no duplicamos si requirió auth, solo guardamos flujos directos de un solo paso
    if (!eraUnaContrasena && response !== 'COMMAND_CLEAR' && !response.startsWith("AUTH_REQUIRED:")) {
        commandHistory.push(command);
    }
    
    historyIndex = -1; 

    if (!pendingAuth) {
        terminal.updatePrompt(kernel.getPromptText());
    }
    };

    // 🌟 EVENT LISTENERS DE TECLADO OPTIMIZADOS
    inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            const value = inputElement.value;
            handleCommand(value);
            inputElement.value = '';
            terminal.scrollToBottom();
        }

        // Flecha Arriba: Navegar al pasado
        if (e.key === 'ArrowUp') {
            if (commandHistory.length > 0 && !pendingAuth) {
                e.preventDefault();
                if (historyIndex === -1) {
                    historyIndex = commandHistory.length - 1;
                } else if (historyIndex > 0) {
                    historyIndex--;
                }
                inputElement.value = commandHistory[historyIndex];
            }
        }

        // Flecha Abajo: Volver al presente
        if (e.key === 'ArrowDown') {
            if (!pendingAuth) {
                e.preventDefault();
                if (historyIndex !== -1) {
                    if (historyIndex < commandHistory.length - 1) {
                        historyIndex++;
                        inputElement.value = commandHistory[historyIndex];
                    } else {
                        historyIndex = -1;
                        inputElement.value = '';
                    }
                }
            }
        }

        // Tabulador (Autocompletar)
        if (e.key === 'Tab') {
            if (pendingAuth) { e.preventDefault(); return; }
            e.preventDefault();
            const currentValue = inputElement.value;
            const completions = kernel.getCompletions(currentValue);

            if (completions.length === 1) {
                const lastSpaceIndex = currentValue.lastIndexOf(' ');
                const textBeforeLastWord = currentValue.substring(0, lastSpaceIndex + 1);
                inputElement.value = textBeforeLastWord + completions[0];
            } else if (completions.length > 1) {
                const suggestions = completions.map(c => {
                    const parts = c.split('/');
                    return c.endsWith('/') ? parts[parts.length - 2] + '/' : parts[parts.length - 1];
                });
                terminal.print("\n" + suggestions.join('  '));
                terminal.updatePrompt(kernel.getPromptText());
            }
        }
    });

    document.addEventListener('click', () => inputElement.focus());

    terminal.print("Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)");
    terminal.print(`System information as of ${new Date().toUTCString()}`);
    terminal.print("");

    terminal.updatePrompt(kernel.getPromptText());
    inputElement.focus();
};

bootstrap();