import { Kernel } from './core/Kernel';
import { TerminalUI } from './ui/Terminal';

const bootstrap = async () => {
    // 1. Captura de elementos
    const outputElement = document.getElementById('output')!;
    const inputElement = document.getElementById('terminal-input') as HTMLInputElement;
    const promptElement = document.getElementById('prompt')!;

    // 2. Inicialización
    const kernel = new Kernel();

    // Mostramos un mensaje temporal de carga si quieres
    outputElement.innerText = "Cargando sistema...";

    // --- LA CLAVE ---
    // Esperamos a que el Kernel termine de hacer el fetch y configurar todo
    await kernel.boot();
    // ----------------

    const terminal = new TerminalUI(outputElement, inputElement, promptElement);
    terminal.clear(); // Limpiamos el "Cargando..."

    // Historial local de la UI (flechas)
    // Tip: Podrías inicializar esto con kernel.getHistory() si quieres que persista
    const commandHistory: string[] = [...kernel.getHistory()];
    let historyIndex = -1;

    // 3. Función de ejecución
    const handleCommand = async (value: string) => {
        const command = value.trim();
        terminal.copyInputToOutput(command);

        if (command !== '') {
            const response = await kernel.execute(command);
            if (response === 'COMMAND_CLEAR') {
                terminal.clear();
            } else if (response !== "") {
                terminal.print(response);
            }
            // Actualizamos nuestro historial local de flechas
            commandHistory.push(command);
        }
        terminal.updatePrompt(kernel.getPromptText());
    };

    // 4. Event Listeners (KeyDown para Enter y Flechas)
    inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            const value = inputElement.value;
            historyIndex = -1;
            handleCommand(value);
            inputElement.value = '';
            terminal.scrollToBottom();
        }

        if (e.key === 'ArrowUp') {
            if (commandHistory.length > 0) {
                e.preventDefault();
                if (historyIndex === -1) historyIndex = commandHistory.length - 1;
                else if (historyIndex > 0) historyIndex--;
                inputElement.value = commandHistory[historyIndex];
            }
        }

        if (e.key === 'ArrowDown') {
            if (historyIndex !== -1) {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    inputElement.value = commandHistory[historyIndex];
                } else {
                    historyIndex = -1;
                    inputElement.value = '';
                }
            }
        }

        if (e.key === 'Tab') {
            e.preventDefault();

            const currentValue = inputElement.value;
            const completions = kernel.getCompletions(currentValue);

            if (completions.length === 1) {
                // Buscamos dónde empieza la última palabra para reemplazarla
                const lastSpaceIndex = currentValue.lastIndexOf(' ');
                const prefix = currentValue.substring(0, lastSpaceIndex + 1);

                inputElement.value = prefix + completions[0];
            }
            else if (completions.length > 1) {
                // Mostrar opciones si hay varias
                terminal.print("\n" + completions.join('  '));
                terminal.updatePrompt(kernel.getPromptText());
                // Restauramos el valor para que el usuario siga escribiendo
                inputElement.value = currentValue;
            }
        }
    });

    // Foco constante
    document.addEventListener('click', () => inputElement.focus());

    // 5. Mensaje de bienvenida (Ya con el Kernel cargado)
    terminal.print("Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)");
    terminal.print(`System information as of ${new Date().toUTCString()}`);
    terminal.print("");

    terminal.updatePrompt(kernel.getPromptText());
    inputElement.focus();
};

// Arrancamos la aplicación
bootstrap();