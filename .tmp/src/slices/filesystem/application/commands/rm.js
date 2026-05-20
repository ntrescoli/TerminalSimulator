"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rm = void 0;
exports.Rm = {
    name: 'rm',
    execute: ({ args, hasFlag, fs }) => {
        if (args.length < 1) {
            return "rm: missing operand";
        }
        const recursive = hasFlag('-r') || hasFlag('-R');
        const force = hasFlag('-f');
        const errors = [];
        for (const path of args) {
            const result = fs.remove(path, recursive);
            if (result.isFailure) {
                if (force && /not found|No such file or directory/i.test(result.getError())) {
                    continue;
                }
                errors.push(`rm: cannot remove '${path}': ${result.getError()}`);
            }
        }
        return errors.length > 0 ? errors.join('\n') : "";
    }
};
