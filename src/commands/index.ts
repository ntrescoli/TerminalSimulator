import { basicCmds } from './basics/00index';
import { filesystemCmds } from './filesystem/00index';
import { textCmds } from './text/00index';
import { usersCmds } from './users/00index';
import { customCmds } from './custom/00index';

// Exportamos un array con todos los comandos para que el Kernel los itere
export const commandList = [
    ...basicCmds,
    ...filesystemCmds,
    ...textCmds,
    ...usersCmds,
    ...customCmds
];