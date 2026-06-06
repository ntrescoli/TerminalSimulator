import { ISliceStateSaver } from '../../../../kernel/domain/ports/out/ISliceStateSaver';
import { UserManagerService } from '../../application/services/UserManagerService';
/**
 * Exportación y carga en formato JSON (orquestado en la infraestructura del Kernel)
 */
export declare class GroupStateSaverImpl implements ISliceStateSaver {
    private readonly userManager;
    readonly key = "groups";
    constructor(userManager: UserManagerService);
    getState(): import('../../domain/entities/Group').Group[];
    loadState(data: any): void;
}
//# sourceMappingURL=GroupStateSaverImpl.d.ts.map