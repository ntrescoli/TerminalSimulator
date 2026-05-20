"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersCmds = void 0;
const groups_1 = require("./groups");
const adduser_1 = require("./adduser");
const addgroup_1 = require("./addgroup");
const su_1 = require("./su");
const useradd_1 = require("./useradd");
const deluser_1 = require("./deluser");
const delgroup_1 = require("./delgroup");
const finger_1 = require("./finger");
const passwd_1 = require("./passwd");
exports.usersCmds = [
    su_1.Su,
    useradd_1.UserAdd,
    groups_1.Groups,
    adduser_1.AddUser,
    addgroup_1.AddGroup,
    deluser_1.DelUser,
    delgroup_1.DelGroup,
    finger_1.Finger,
    passwd_1.Passwd
];
