import { ISliceStateSaver } from '@/kernel/domain/ports/out/ISliceStateSaver';
import { UserManagerService } from '../../application/services/UserManagerService';

/**
 * Exportación y carga en formato JSON (orquestado en la infraestructura del Kernel)
 */
export class GroupStateSaverImpl implements ISliceStateSaver {
    readonly key = 'groups';

    constructor(private userManager: UserManagerService) { }

    getState() {
        // primero sincronizar passwd y groups???
        return this.userManager.getGroups();
    }

    loadState(data: any) {     
        this.userManager.saveGroup(data);   
    }

}