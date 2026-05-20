"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestContext = createTestContext;
exports.loadCommand = loadCommand;
const FileSystem_1 = require("../src/slices/filesystem/application/services/FileSystem");
const Environment_1 = require("../src/slices/system/domain/entities/Environment");
function createTestContext() {
    const env = new Environment_1.Environment();
    env.set('USER', 'root');
    env.set('HOSTNAME', 'ubuntu-server');
    const fs = new FileSystem_1.FileSystem(env);
    const history = ['ls', 'pwd', 'echo hi'];
    const flagValues = {};
    const kernel = {
        getUptime: () => 1000 * 60 * 60,
        getHistory: () => history,
        clearHistory: () => {
            history.length = 0;
        },
        processCommandLine: async (input) => `executed: ${input}`,
    };
    const userManager = {
        getUsers: () => [],
        getGroups: () => [],
        getUserByName: (n) => undefined,
        getGroupByName: (g) => undefined,
        saveUser: (_) => null,
        saveGroup: (_) => null,
        deleteUser: (_) => null,
        deleteGroup: (_) => null,
        addUserToGroup: (_, _g) => null,
    };
    const base = {
        args: [],
        options: [],
        rawArgs: [],
        rawInput: '',
        flagValues,
        fs,
        env,
        userManager,
        hasFlag: (name) => !!flagValues[name],
        kernel,
        pipeInput: undefined,
    };
    return { env, fs, userManager, kernel, base };
}
async function loadCommand(modulePath) {
    const mod = await Promise.resolve(`${modulePath}`).then(s => __importStar(require(s)));
    const candidates = [
        'Command', 'default', 'Touch', 'Mkdir', 'Ls', 'Cd', 'Mv', 'Cp', 'Rm', 'Rmdir', 'File', 'Pwd',
        'AddUser', 'AddGroup', 'UserAdd', 'Useradd', 'Addgroup', 'DelUser', 'DelGroup', 'Groups',
        'Whoami', 'Who', 'Uptime', 'History', 'Help', 'Env', 'Echo', 'DateCommand', 'Clear', 'Unalias',
        'Sudo', 'Su', 'Alias', 'Cal', 'Chown', 'Chgrp'
    ];
    for (const name of candidates) {
        if (mod[name])
            return mod[name];
    }
    const found = Object.values(mod).find((v) => v && typeof v.execute === 'function');
    if (found)
        return found;
    throw new Error('No command export found in ' + modulePath);
}
