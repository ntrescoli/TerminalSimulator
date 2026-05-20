"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cp = void 0;
exports.Cp = {
    name: 'cp',
    execute: ({ args, hasFlag, fs }) => {
        if (args.length < 2) {
            return args.length === 1
                ? `cp: missing destination file operand after '${args[0]}'`
                : "cp: missing file operand";
        }
        const src = args[0];
        const dest = args[1];
        const recursive = hasFlag('-r') || hasFlag('-R') || hasFlag('--recursive');
        const result = fs.copy(src, dest, recursive);
        if (result.isFailure) {
            return result.getError();
        }
        return ""; // Silencioso en caso de éxito
    }
};
