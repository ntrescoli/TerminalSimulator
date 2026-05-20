"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Whoami = void 0;
exports.Whoami = {
    name: 'whoami',
    execute: ({ env }) => env.get('USER') || 'unknown'
};
