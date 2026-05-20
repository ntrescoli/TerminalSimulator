"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Echo = void 0;
exports.Echo = {
    name: 'echo',
    execute: ({ args, env }) => {
        return args.map(arg => {
            if (arg.startsWith('$')) {
                const varName = arg.substring(1);
                return env.get(varName) || '';
            }
            return arg;
        }).join(' ');
    }
};
