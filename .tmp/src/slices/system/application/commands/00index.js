"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicCmds = void 0;
const echo_1 = require("./echo");
const whoami_1 = require("./whoami");
const clear_1 = require("./clear");
const help_1 = require("./help");
const env_1 = require("./env");
const history_1 = require("./history");
const sudo_1 = require("./sudo");
const date_1 = require("./date");
const uptime_1 = require("./uptime");
const who_1 = require("./who");
const chown_1 = require("./chown");
const cal_1 = require("./cal");
const chgrp_1 = require("./chgrp");
const alias_1 = require("./alias");
const unalias_1 = require("./unalias");
exports.basicCmds = [
    sudo_1.Sudo,
    clear_1.Clear,
    echo_1.Echo,
    env_1.Env,
    help_1.Help,
    whoami_1.Whoami,
    history_1.History,
    date_1.DateCommand,
    uptime_1.Uptime,
    who_1.Who,
    who_1.W,
    chown_1.Chown,
    cal_1.Cal,
    chgrp_1.Chgrp,
    alias_1.Alias,
    unalias_1.Unalias
];
