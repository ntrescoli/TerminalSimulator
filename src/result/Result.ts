// @/result/Result.ts
export class Result<T> {
    public readonly isSuccess: boolean;
    public readonly isFailure: boolean;
    private readonly _error?: string;
    private readonly _value?: T;

    private constructor(isSuccess: boolean, error?: string, value?: T) {
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this._error = error;
        this._value = value;
    }

    public static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static fail<U>(error: string): Result<U> {
        return new Result<U>(false, error, undefined);
    }

    /**
     * Extrae el valor en caso de éxito.
     */
    public getValue(): T {
        if (!this.isSuccess) {
            throw new Error('No se puede obtener el valor de un resultado fallido.');
        }
        return this._value!;
    }

    /**
     * Getter para el error. Al usar 'get error()', en tus comandos 
     * accedes de forma natural usando 'result.error'.
     */
    public getError(): string {
        if (!this.isFailure) {
            throw new Error('No se puede obtener el error de un resultado exitoso.');
        }
        // IMPORTANTE: Asegúrate de retornar la propiedad privada con el guion bajo
        return this._error || 'Unknown error'; 
    }
}