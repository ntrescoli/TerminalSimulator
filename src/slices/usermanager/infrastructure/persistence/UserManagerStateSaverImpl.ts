import { ISliceStateSaver } from '@/kernel/domain/ports/out/ISliceStateSaver';
import { UserManagerService } from '../../application/services/UserManagerService';

/**
 * Exportación y carga en formato JSON (orquestado en la infraestructura del Kernel)
 */
export class UserManagerStateSaverImpl implements ISliceStateSaver {
    readonly key = 'users';

    constructor(private userManager: UserManagerService) { }

    getState() {
        // primero sincronizar passwd y groups???
        return [ 
            this.userManager.getUsers(), 
            this.userManager.getGroups() 
        ];
    }

    loadState(data: any) {     
        this.userManager.saveUser(data[0]);
        this.userManager.saveGroup(data[1]);   
    }

}