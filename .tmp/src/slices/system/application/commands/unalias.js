"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unalias = void 0;
exports.Unalias = {
    name: 'unalias',
    valuedFlags: [],
    execute: async ({ args, env }) => {
        if (args.length < 1) {
            return "unalias: usage: unalias name [name ...]";
        }
        for (const name of args) {
            const existed = env.removeAlias(name.trim());
            if (!existed) {
                return `unalias: ${name}: not found`;
            }
        }
        return "";
    }
};
