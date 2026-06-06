/**
 * Gestiona las variables de entorno del sistema (PATH, USER, PWD, etc.)
 * Actúa como la fuente de configuración dinámica para los procesos del Kernel.
 */
export declare class Environment {
    private vars;
    private readonly aliases;
    constructor();
    /**
     * Obtiene el valor de una variable de entorno.
     * @param key Nombre de la variable (ej: 'USER')
     * @returns El valor de la variable o un string vacío si no existe.
     */
    get(key: string): string;
    /**
     * Establece o actualiza una variable de entorno.
     * @param key Nombre de la variable
     * @param value Valor a asignar
     */
    set(key: string, value: string): void;
    /**
     * Verifica si una variable existe en el entorno.
     */
    has(key: string): boolean;
    /**
     * Elimina una variable de entorno (equivalente a 'unset' en bash).
     */
    delete(key: string): void;
    /**
     * Devuelve una copia de todas las variables actuales.
     * Fundamental para el comando 'env' y para la exportación a JSON.
     */
    getAll(): Record<string, string>;
    setAlias(name: string | undefined, command: string | undefined): void;
    getAlias(name: string): string | undefined;
    removeAlias(name: string): boolean;
    getAliases(): [string, string][];
    /**
     * Carga un conjunto inicial de variables.
     */
    loadDefaults(): void;
}
//# sourceMappingURL=Environment.d.ts.map