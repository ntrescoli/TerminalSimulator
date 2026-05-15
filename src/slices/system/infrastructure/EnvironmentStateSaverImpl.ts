import { ISliceStateSaver } from '@/kernel/domain/ports/out/ISliceStateSaver';
import { Environment } from '../domain/entities/Environment';

export class EnvironmentStateSaverImpl implements ISliceStateSaver {
    readonly key = 'env';

    constructor(private env: Environment) { }

    /**
     * Devuelve una copia de todas las variables actuales.
     * Fundamental para el comando 'env' y para la exportación a JSON.
     */
    public getState(): Record<string, string> {
        return this.env.getAll(); // Llama al nuevo clonador seguro
    }

    /**
     * Permite cargar múltiples variables a la vez (ej: desde un JSON).
     */
    public loadState(obj: Record<string, any>): void {
        for (const [key, value] of Object.entries(obj)) {
            this.env.set(key, String(value));
        }
    }
}