"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pwd = void 0;
const PathResolver_1 = require("../services/PathResolver");
exports.Pwd = {
    name: 'pwd',
    execute: ({ fs }) => PathResolver_1.PathResolver.getAbsolutePath(fs.getCurrentDirectory())
};
