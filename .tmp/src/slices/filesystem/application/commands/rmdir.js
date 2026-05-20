"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rmdir = void 0;
exports.Rmdir = {
    name: 'rmdir',
    execute: ({ args, fs }) => {
        if (args.length < 1) {
            return "rmdir: missing operand";
        }
        const errors = [];
        for (const path of args) {
            const result = fs.removeDirectory(path);
            if (result.isFailure) {
                errors.push(`rmdir: ${result.getError()}`);
            }
        }
        return errors.length > 0 ? errors.join('\n') : "";
    }
};
