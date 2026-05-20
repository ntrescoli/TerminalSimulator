"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesystemCmds = void 0;
const cd_1 = require("./cd");
const chmod_1 = require("./chmod");
const ls_1 = require("./ls");
const mkdir_1 = require("./mkdir");
const pwd_1 = require("./pwd");
const touch_1 = require("./touch");
const file_1 = require("./file");
const rm_1 = require("./rm");
const rmdir_1 = require("./rmdir");
const cp_1 = require("./cp");
const mv_1 = require("./mv");
exports.filesystemCmds = [
    cd_1.Cd,
    chmod_1.Chmod,
    ls_1.Ls,
    mkdir_1.Mkdir,
    pwd_1.Pwd,
    touch_1.Touch,
    file_1.File,
    rm_1.Rm,
    rmdir_1.Rmdir,
    cp_1.Cp,
    mv_1.Mv,
];
