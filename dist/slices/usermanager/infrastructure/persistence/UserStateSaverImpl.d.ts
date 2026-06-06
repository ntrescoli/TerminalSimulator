import { ISliceStateSaver } from '../../../../kernel/domain/ports/out/ISliceStateSaver';
import { UserManagerService } from '../../application/services/UserManagerService';
/**
 * Exportación y carga en formato JSON (orquestado en la infraestructura del Kernel)
 */
export declare class UserStateSaverImpl implements ISliceStateSaver {
    private readonly userManager;
    readonly key = "users";
    constructor(userManager: UserManagerService);
    getState(): import('../../domain/entities/User').User[];
    loadState(data: any): void;
}
//# sourceMappingURL=UserStateSaverImpl.d.ts.map