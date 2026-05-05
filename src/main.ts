import { Kernel } from './core/Kernel';
import { TerminalUI } from './ui/Terminal';

// 1. Captura de elementos del DOM
const outputElement = document.getElementById('output')!;
const inputElement = document.getElementById('terminal-input') as HTMLInputElement;
const promptElement = document.getElementById('prompt')!;

// 2. Inicialización de las instancias
const kernel = new Kernel();
const terminal = new TerminalUI(outputElement, inputElement, promptElement);

const commandHistory: string[] = [];
let historyIndex = -1; // -1 significa que no estamos navegando el historial todavía

/**
 * Orquestador: une la lógica del Kernel con la visualización de la UI
 */
const handleCommand = (value: string) => {
    const command = value.trim();

    // Siempre copiamos el input al historial primero
    terminal.copyInputToOutput(command);

    if (command !== '') {
        // El Kernel procesa la lógica pura
        const response = kernel.execute(command);

        // Si el comando devuelve el flag de limpiar, actuamos sobre la UI
        if (response === 'COMMAND_CLEAR') {
            terminal.clear();
        } else {
            // De lo contrario, imprimimos la respuesta normal
            terminal.print(response);
        }
    }

    // Actualizamos el prompt (por si cambió el directorio, usuario o hostname)
    terminal.updatePrompt(kernel.getPromptText());
};

// 3. Event Listeners
inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
    // Depuración: Descomenta la línea de abajo para ver si detecta las teclas en la consola (F12)
    // console.log("Tecla pulsada:", e.key, "Indice:", historyIndex, "Historial:", commandHistory);

    if (e.key === 'Enter') {
        const value = inputElement.value;
        
        if (value.trim() !== '') {
            commandHistory.push(value);
        }
        
        historyIndex = -1; 
        handleCommand(value); 
        inputElement.value = '';
        terminal.scrollToBottom();
    }

    if (e.key === 'ArrowUp') {
        if (commandHistory.length > 0) {
            e.preventDefault(); 

            if (historyIndex === -1) {
                historyIndex = commandHistory.length - 1;
            } else if (historyIndex > 0) {
                historyIndex--;
            }

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
});

// Forzar el foco siempre al input
document.addEventListener('click', () => {
    inputElement.focus();
});

// 4. Boot Sequence (Inicio del sistema)
window.addEventListener('load', () => {
    terminal.print("Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)");
    terminal.print(" * Documentation:  https://help.ubuntu.com");
    terminal.print(" * Management:     https://landscape.canonical.com");
    terminal.print(" * Support:        https://ubuntu.com/pro");
    terminal.print("");
    terminal.print(`System information as of ${new Date().toUTCString()}`);
    terminal.print("");
    
    terminal.updatePrompt(kernel.getPromptText());
    inputElement.focus();
});