import { Kernel } from './core/Kernel';
import { TerminalUI } from './ui/Terminal';

// 1. Captura de elementos del DOM
// Usamos "!" para asegurar a TS que estos elementos existen en tu index.html
const outputElement = document.getElementById('output')!;
const inputElement = document.getElementById('terminal-input') as HTMLInputElement;
const promptElement = document.getElementById('prompt')!;

// 2. Inicialización de las instancias
const kernel = new Kernel();
const terminal = new TerminalUI(outputElement, inputElement, promptElement);

// Historial de comandos
const commandHistory: string[] = [];
let historyIndex = -1; 

/**
 * Orquestador: une la lógica del Kernel con la visualización de la UI
 */
const handleCommand = async (value: string) => {
    const command = value.trim();

    // 1. Mostramos lo que el usuario escribió en la pantalla
    terminal.copyInputToOutput(command);

    if (command !== '') {
        // 2. AHORA ESPERAMOS al Kernel con await
        const response = await kernel.execute(command);

        // 3. Gestión de Flags Especiales o Impresión
        if (response === 'COMMAND_CLEAR') {
            terminal.clear();
        } else if (response !== "") {
            terminal.print(response);
        }
    }

    // 4. Actualizamos el prompt después de que el comando termine
    terminal.updatePrompt(kernel.getPromptText());
};

// 3. Event Listeners
inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
    
    // Ejecutar comando
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

    // Navegación por el Historial (Flecha Arriba)
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

    // Navegación por el Historial (Flecha Abajo)
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

// Mantener el foco en el input incluso si el usuario hace click en otra parte de la terminal
document.addEventListener('click', () => {
    inputElement.focus();
});

/**
 * 4. Boot Sequence (Secuencia de inicio)
 * Se ejecuta cuando la ventana ha cargado completamente
 */
window.addEventListener('load', () => {
    terminal.print("Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)");
    terminal.print(" * Documentation:  https://help.ubuntu.com");
    terminal.print(" * Management:     https://landscape.canonical.com");
    terminal.print(" * Support:        https://ubuntu.com/pro");
    terminal.print("");
    terminal.print(`System information as of ${new Date().toUTCString()}`);
    terminal.print("Atención: Sistema de archivos virtual cargado en memoria.");
    terminal.print("");
    
    // Sincronizamos el prompt inicial
    terminal.updatePrompt(kernel.getPromptText());
    inputElement.focus();
});