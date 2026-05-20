"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
exports.Env = {
    name: 'env',
    execute: ({ env }) => {
        const allVars = env.getAll();
        return Object.entries(allVars)
            .map(([key, val]) => `${key}=${val}`)
            .join('\n');
    }
};
