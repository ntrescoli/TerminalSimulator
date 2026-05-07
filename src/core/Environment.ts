// src/core/Environment.ts

/**
 * Gestiona las variables de entorno del sistema (PATH, USER, PWD, etc.)
 * Actúa como la fuente de configuración dinámica para los procesos del Kernel.
 */
export class Environment {
    private vars: Record<string, string>;

    constructor() {
        // Inicializamos vacío para permitir que el Kernel decida qué cargar
        this.vars = {};
    }

    /**
     * Carga un conjunto inicial de variables. 
     * Útil cuando el JSON de configuración no está disponible.
     */
    public loadDefaults(): void {
        this.vars = {
            USER: 'root',
            HOSTNAME: 'ubuntu-server',
            HOME: '/root',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            SHELL: '/bin/bash',
            PWD: '/',
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8'
        };
    }

    /**
     * Obtiene el valor de una variable de entorno.
     * @param key Nombre de la variable (ej: 'USER')
     * @returns El valor de la variable o un string vacío si no existe.
     */
    public get(key: string): string {
        return this.vars[key] || '';
    }

    /**
     * Establece o actualiza una variable de entorno.
     * @param key Nombre de la variable
     * @param value Valor a asignar
     */
    public set(key: string, value: string): void {
        this.vars[key] = value;
    }

    /**
     * Verifica si una variable existe en el entorno.
     */
    public has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.vars, key);
    }

    /**
     * Elimina una variable de entorno (equivalente a 'unset' en bash).
     */
    public delete(key: string): void {
        delete this.vars[key];
    }

    /**
     * Devuelve una copia de todas las variables actuales.
     * Fundamental para el comando 'env' y para la exportación a JSON.
     */
    public getAll(): Record<string, string> {
        return { ...this.vars };
    }

    /**
     * Permite cargar múltiples variables a la vez (ej: desde un JSON).
     */
    public loadFromObject(obj: Record<string, any>): void {
        for (const [key, value] of Object.entries(obj)) {
            this.set(key, String(value));
        }
    }
}