import { Echo } from './echo';
import { Whoami } from './whoami';
import { Clear } from './clear';
import { Help } from './help';
import { Env } from './env';
import { History } from './history';
import { Sudo } from './sudo';
import { DateCommand } from './date';
import { Uptime } from './uptime';

export const basicCmds = [
    Sudo,
    Clear,
    Echo,
    Env,
    Help,
    Whoami,
    History,
    DateCommand,
    Uptime
];