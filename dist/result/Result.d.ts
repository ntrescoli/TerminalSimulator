export declare class Result<T> {
    readonly isSuccess: boolean;
    readonly isFailure: boolean;
    private readonly _error?;
    private readonly _value?;
    private constructor();
    static ok<U>(value?: U): Result<U>;
    static fail<U>(error: string): Result<U>;
    /**
     * Extrae el valor en caso de éxito.
     */
    getValue(): T;
    /**
     * Getter para el error. Al usar 'get error()', en tus comandos
     * accedes de forma natural usando 'result.error'.
     */
    getError(): string;
}
//# sourceMappingURL=Result.d.ts.map