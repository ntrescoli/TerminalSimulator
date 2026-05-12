import { customCmds } from '../../../custom/application/commands/00index';
import { filesystemCmds } from '../../../filesystem/application/commands/00index';
import { textCmds } from '../../../filesystem/application/text/00index';
import { basicCmds } from '../../../system/application/commands/00index';
import { usersCmds } from '../../../usermanager/application/commands/00index';

// Exportamos un array con todos los comandos para que el Kernel los itere
export const commandList = [
    ...basicCmds,
    ...filesystemCmds,
    ...textCmds,
    ...usersCmds,
    ...customCmds
];