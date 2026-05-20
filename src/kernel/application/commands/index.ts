import { filesystemCmds } from '../../../slices/filesystem/application/commands/00index';
import { textCmds } from '../../../slices/filesystem/application/text/00index';
import { basicCmds } from '../../../slices/system/application/commands/00index';
import { usersCmds } from '../../../slices/usermanager/application/commands/00index';
import { customCmds } from './custom/00index';

// Exportamos un array con todos los comandos para que el Kernel los itere
export const commandList = [
    ...basicCmds,
    ...filesystemCmds,
    ...textCmds,
    ...usersCmds,
    ...customCmds,
];