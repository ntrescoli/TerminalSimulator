"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cd = void 0;
const PathResolver_1 = require("../services/PathResolver");
exports.Cd = {
    name: 'cd',
    execute: ({ args, fs, env }) => {
        const path = args[0] || '~';
        const result = fs.changeDirectory(path);
        // Si falló, exponemos el string de error formateado
        if (result.isFailure)
            return `cd: ${result.getError()}`;
        if (path === '-')
            return PathResolver_1.PathResolver.getAbsolutePath(fs.getCurrentDirectory());
        env.set('PWD', PathResolver_1.PathResolver.getAbsolutePath(fs.getCurrentDirectory()));
        return "";
    }
};
