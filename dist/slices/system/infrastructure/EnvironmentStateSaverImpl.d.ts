import { ISliceStateSaver } from '../../../kernel/domain/ports/out/ISliceStateSaver';
import { Environment } from '../domain/entities/Environment';
export declare class EnvironmentStateSaverImpl implements ISliceStateSaver {
    private readonly env;
    readonly key = "env";
    constructor(env: Environment);
    /**
     * Devuelve una copia de todas las variables actuales.
     * Fundamental para el comando 'env' y para la exportación a JSON.
     */
    getState(): Record<string, string>;
    /**
     * Permite cargar múltiples variables a la vez (ej: desde un JSON).
     */
    loadState(obj: Record<string, any>): void;
}
//# sourceMappingURL=EnvironmentStateSaverImpl.d.ts.map