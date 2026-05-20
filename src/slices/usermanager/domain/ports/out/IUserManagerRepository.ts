import type { Group } from '../../entities/Group';
import type { User } from '../../entities/User';

// Intermediario entre dominio e infrastructure
export interface IUserManagerRepository {
      // Lectura
      getUsers(): User[];
      getGroups(): Group[];

      // Escritura (reemplazan el contenido total)
      saveUsers(users: User[]): void;
      saveGroups(groups: Group[]): void;

}