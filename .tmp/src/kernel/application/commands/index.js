"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandList = void 0;
const _00index_1 = require("../../../slices/filesystem/application/commands/00index");
const _00index_2 = require("../../../slices/filesystem/application/text/00index");
const _00index_3 = require("../../../slices/system/application/commands/00index");
const _00index_4 = require("../../../slices/usermanager/application/commands/00index");
const _00index_5 = require("./custom/00index");
// Exportamos un array con todos los comandos para que el Kernel los itere
exports.commandList = [
    ..._00index_3.basicCmds,
    ..._00index_1.filesystemCmds,
    ..._00index_2.textCmds,
    ..._00index_4.usersCmds,
    ..._00index_5.customCmds
];
