"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textCmds = void 0;
const cat_1 = require("./cat");
const cmp_1 = require("./cmp");
const diff_1 = require("./diff");
const grep_1 = require("./grep");
const wc_1 = require("./wc");
const head_1 = require("./head");
const tail_1 = require("./tail");
const cut_1 = require("./cut");
const sort_1 = require("./sort");
const uniq_1 = require("./uniq");
exports.textCmds = [
    cat_1.Cat,
    grep_1.Grep,
    cmp_1.Cmp,
    diff_1.Diff,
    head_1.Head,
    tail_1.Tail,
    wc_1.Wc,
    cut_1.Cut,
    sort_1.Sort,
    uniq_1.Uniq,
];
