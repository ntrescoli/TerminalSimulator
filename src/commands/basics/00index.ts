import { Echo } from './echo';
import { Whoami } from './whoami';
import { Clear } from './clear';
import { Help } from './help';
import { Env } from './env';
import { History } from './history';
import { Sudo } from './sudo';

export const basicCmds = [
    Sudo,
    Clear,
    Echo,
    Env,
    Help,
    Whoami,
    History,
];