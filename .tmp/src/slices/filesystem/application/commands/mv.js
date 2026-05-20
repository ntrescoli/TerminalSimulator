"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mv = void 0;
exports.Mv = {
    name: 'mv',
    execute: ({ args, fs }) => {
        if (args.length < 2) {
            return args.length === 1
                ? `mv: missing destination file operand after '${args[0]}'`
                : "mv: missing file operand";
        }
        const src = args[0];
        const dest = args[1];
        const result = fs.move(src, dest);
        if (result.isFailure) {
            return result.getError();
        }
        return ""; // Silencioso en caso de éxito
    }
};
