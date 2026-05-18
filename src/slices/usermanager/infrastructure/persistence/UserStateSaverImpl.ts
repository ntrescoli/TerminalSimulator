import { ISliceStateSaver } from '@/kernel/domain/ports/out/ISliceStateSaver';
import { UserManagerService } from '../../application/services/UserManagerService';

/**
 * Exportación y carga en formato JSON (orquestado en la infraestructura del Kernel)
 */
export class UserStateSaverImpl implements ISliceStateSaver {
    readonly key = 'users';

    constructor(private userManager: UserManagerService) { }

    getState() {
        // primero sincronizar passwd y groups???
        return this.userManager.getUsers();
    }

    loadState(data: any) {     
        // this.userManager.saveUser(data) 
        console.log("🔍 STATE SAVER: Datos crudos recibidos desde el JSON:", data);

    if (data && Array.isArray(data)) {
        // Aquí es donde tu saver le pasa los datos al servicio o repositorio
        // Vamos a ver si el array mapeado mantiene las contraseñas
        data.forEach((u: any) => {
            console.log(`🔍 STATE SAVER: Procesando usuario '${u.username}':`, {
                tienePasswordEnJson: !!u.password,
                passwordValor: u.password
            });
        });
    } 
    }

}