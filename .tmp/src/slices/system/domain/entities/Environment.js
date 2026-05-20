"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
/**
 * Gestiona las variables de entorno del sistema (PATH, USER, PWD, etc.)
 * Actúa como la fuente de configuración dinámica para los procesos del Kernel.
 */
class Environment {
    constructor() {
        this.aliases = new Map();
        // Inicializamos vacío para permitir que el Kernel decida qué cargar
        this.vars = {};
    }
    /**
     * Obtiene el valor de una variable de entorno.
     * @param key Nombre de la variable (ej: 'USER')
     * @returns El valor de la variable o un string vacío si no existe.
     */
    get(key) {
        return this.vars[key] || '';
    }
    /**
     * Establece o actualiza una variable de entorno.
     * @param key Nombre de la variable
     * @param value Valor a asignar
     */
    set(key, value) {
        this.vars[key] = value;
    }
    /**
     * Verifica si una variable existe en el entorno.
     */
    has(key) {
        return Object.prototype.hasOwnProperty.call(this.vars, key);
    }
    /**
     * Elimina una variable de entorno (equivalente a 'unset' en bash).
     */
    delete(key) {
        delete this.vars[key];
    }
    /**
     * Devuelve una copia de todas las variables actuales.
     * Fundamental para el comando 'env' y para la exportación a JSON.
     */
    getAll() {
        return { ...this.vars };
    }
    setAlias(name, command) {
        this.aliases.set(name, command);
    }
    getAlias(name) {
        return this.aliases.get(name);
    }
    removeAlias(name) {
        return this.aliases.delete(name);
    }
    getAliases() {
        return Array.from(this.aliases.entries());
    }
    /**
     * Carga un conjunto inicial de variables.
     */
    loadDefaults() {
        this.vars = {
            USER: 'root',
            HOSTNAME: 'ubuntu-server',
            HOME: '/root',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            SHELL: '/bin/bash',
            PWD: '/',
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8',
            SUDO_USER: ''
        };
    }
}
exports.Environment = Environment;
