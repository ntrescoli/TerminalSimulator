export class TerminalUI {
    private readonly outputElement: HTMLElement;
    private readonly inputElement: HTMLInputElement;
    private readonly promptElement: HTMLElement;
    private clickListener: (() => void) | null = null;

    constructor(output: HTMLElement, input: HTMLInputElement, prompt: HTMLElement) {
        this.outputElement = output;
        this.inputElement = input;
        this.promptElement = prompt;
        
        this.init();
    }

    private init() {
        // En lugar de escuchar a 'window', escuchamos los clics en el contenedor superior de esta terminal.
        // Así, si la terminal está oculta (display: none), el foco no se robará entre instancias.
        const container = this.outputElement.parentElement;
        if (container) {
            this.clickListener = () => {
                if (!this.inputElement.disabled) {
                    this.inputElement.focus();
                }
            };
            container.addEventListener('click', this.clickListener);
        }
    }

    /**
     * MÉTODO DE LIMPIEZA (Opcional pero recomendado para el hipervisor)
     * Si alguna vez necesitas destruir por completo esta UI visual, limpia su listener de clics.
     */
    public destroy() {
        const container = this.outputElement.parentElement;
        if (container && this.clickListener) {
            container.removeEventListener('click', this.clickListener);
        }
    }

    /**
     * Imprime una línea en la terminal
     */
    print(text: string, className = '') {
        const line = document.createElement('div');
        if (className) line.classList.add(className);
        
        // El CSS encapsulado ya maneja esto, pero lo dejamos como fallback seguro
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
        this.scrollToBottom(); // Asegura el scroll al enviar comandos
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

    /**
     * Cambia el tipo de input (text o password) dinámicamente
     */
    setInputType(type: 'text' | 'password') {
        this.inputElement.type = type;
    }
}