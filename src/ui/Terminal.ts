export class TerminalUI {
    private outputElement: HTMLElement;
    private inputElement: HTMLInputElement;
    private promptElement: HTMLElement;

    constructor(output: HTMLElement, input: HTMLInputElement, prompt: HTMLElement) {
        this.outputElement = output;
        this.inputElement = input;
        this.promptElement = prompt;
        
        this.init();
    }

    private init() {
        // Aseguramos que el input siempre tenga el foco
        window.addEventListener('click', () => this.inputElement.focus());
    }

    /**
     * Imprime una línea en la terminal
     */
    print(text: string, className: string = '') {
        const line = document.createElement('div');
        if (className) line.classList.add(className);
        
        // Añadimos estilo para preservar espacios y saltos de línea (\n)
        line.style.whiteSpace = 'pre-wrap'; 
        line.style.wordBreak = 'break-all';
        
        line.innerHTML = text || '&nbsp;'; 
        
        this.outputElement.appendChild(line);
        this.scrollToBottom();
    }
    
    /**
     * Copia lo que el usuario escribió al historial antes de procesarlo
     */
    copyInputToOutput(command: string) {
        const historyLine = document.createElement('div');
        historyLine.classList.add('history-line');
        
        const promptCopy = document.createElement('span');
        promptCopy.className = 'prompt';
        promptCopy.innerText = this.promptElement.innerText + ' ';
        
        const commandText = document.createElement('span');
        commandText.innerText = command;
        
        historyLine.appendChild(promptCopy);
        historyLine.appendChild(commandText);
        this.outputElement.appendChild(historyLine);
    }

    /**
     * Actualiza el texto del prompt (ej: al cambiar de usuario o carpeta)
     */
    updatePrompt(text: string) {
        this.promptElement.innerText = text;
    }

    /**
     * Hace scroll automático hacia abajo
     */
    scrollToBottom() {
        const container = this.outputElement.parentElement;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    /**
     * Limpia la pantalla (para el comando 'clear')
     */
    clear() {
        this.outputElement.innerHTML = '';
    }
}