export class Environment {
    private vars: Record<string, string>;

    constructor() {
        this.vars = {
            USER: 'root',
            HOSTNAME: 'ubuntu-server',
            HOME: '/root',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin',
            SHELL: '/bin/bash',
            PWD: '/',
            TERM: 'xterm-256color' // Añadido para dar más realismo
        };
    }

    get(key: string): string {
        return this.vars[key] || '';
    }

    set(key: string, value: string): void {
        this.vars[key] = value;
    }

    // Útil para el comando 'env' o 'export' sin argumentos
    getAll(): Record<string, string> {
        return { ...this.vars };
    }

    // Útil para el comando 'unset'
    delete(key: string): void {
        delete this.vars[key];
    }
}