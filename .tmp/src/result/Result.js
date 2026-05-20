"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
// @/result/Result.ts
class Result {
    constructor(isSuccess, error, value) {
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this._error = error;
        this._value = value;
    }
    static ok(value) {
        return new Result(true, undefined, value);
    }
    static fail(error) {
        return new Result(false, error, undefined);
    }
    /**
     * Extrae el valor en caso de éxito.
     */
    getValue() {
        if (!this.isSuccess) {
            throw new Error("No se puede obtener el valor de un resultado fallido.");
        }
        return this._value;
    }
    /**
     * Getter para el error. Al usar 'get error()', en tus comandos
     * accedes de forma natural usando 'result.error'.
     */
    getError() {
        if (!this.isFailure) {
            throw new Error("No se puede obtener el error de un resultado exitoso.");
        }
        // IMPORTANTE: Asegúrate de retornar la propiedad privada con el guion bajo
        return this._error || "Unknown error";
    }
}
exports.Result = Result;
