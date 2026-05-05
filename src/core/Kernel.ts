import { FileSystem } from './FileSystem';
import { Environment } from './Environment';

export class Kernel {
    private fs: FileSystem;
    private env: Environment;
    private commands: Record<string, (args: string[]) => string> = {};

    constructor() {
        this.fs = new FileSystem();
        this.env = new Environment();
        this.setupCommands();
    }

    private setupCommands() {
        this.commands = {
            // Gestión de Ayuda y UI
            'help': () => `Comandos disponibles: ${Object.keys(this.commands).join(', ')}`,
            'clear': () => 'COMMAND_CLEAR',

            // Información del Sistema (Environment)
            'whoami': () => this.env.get('USER'),
            'hostname': () => this.env.get('HOSTNAME'),
            
            'echo': (args: string[]) => {
                // Si el comando es: echo hola mundo > nota.txt
                if (args.includes('>')) {
                    const index = args.indexOf('>');
                    const content = args.slice(0, index).join(' ');
                    const fileName = args[index + 1];
                    
                    if (!fileName) return "-bash: syntax error near unexpected token `newline'";
                    
                    this.fs.touch(fileName, content); // Modifica touch para que acepte contenido opcional
                    return "";
                }
                return args.join(' ');
            },

            // Comandos de FileSystem
            'ls': (args) => {
                if(this.fs.ls().length < 0) {
                    return "directorio vacío";
                } 
                else if(args.includes('-l')) {
                    return this.fs.lsDetailed().join('\n');
                } 
                else {
                    return this.fs.ls().join('  ');
                }
            },
            'touch': (args) => {
                if (args.length === 0) return "touch: missing file operand";
                this.fs.touch(args[0]);
                return "";
            },
            'cat': (args) => {
                if (args.length === 0) return "cat: missing file operand";
                return this.fs.cat(args[0]);
            },
            'pwd': () => this.fs.getPresentWorkingDirectory(),
            'mkdir': (args) => {
                if (args.length === 0) return "mkdir: missing operand";
                this.fs.mkdir(args[0]);
                return "";
            },
            'cd': (args) => {
                if (args.length === 0) return ""; 
                const error = this.fs.cd(args[0]);
                return error || "";
            },
            // 'history': () => {
            //     // Aquí hay un truco: como el historial vive en main.ts, 
            //     // podrías pasarlo como argumento o manejarlo aquí.
            //     // Si quieres que el Kernel lo gestione, añade una propiedad private history: string[] = []
            //     return this.getHistoryList().join('\n');
            // },
        };
    }

    execute(input: string): string {
        if (!input.trim()) return "";

        // 1. Normalizamos el símbolo de redirección
        const preProcessed = input.replace(/>/g, ' > ');

        // 2. Nueva lógica de captura más limpia
        const regex = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
        const parts: string[] = [];
        let match;

        while ((match = regex.exec(preProcessed)) !== null) {
            // match[1] son comillas dobles, match[2] simples, match[3] palabras sin comillas
            const token = match[1] !== undefined ? match[1] : 
                        match[2] !== undefined ? match[2] : 
                        match[3];
            if (token !== undefined) parts.push(token);
        }

        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[commandName]) {
            return this.commands[commandName](args);
        }

        return `-bash: ${commandName}: command not found`;
    }

    getPromptText(): string {
        const user = this.env.get('USER');
        const host = this.env.get('HOSTNAME');
        // Usamos el FS para mostrar la carpeta actual en el prompt
        const path = this.fs.getPresentWorkingDirectory();
        return `${user}@${host}:${path}$ `;
    }
}