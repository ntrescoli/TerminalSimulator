import { Group } from "../../entities/Group";
import { User } from "../../entities/User";

// Intermediario entre application y domain (TODAVIA NO SE APLICA)
export interface UserManagerUseCase {
      // Lectura
      getUsers(): User[];
      getGroups(): Group[];

      // Escritura (reemplazan el contenido total)
      saveUsers(users: User[]): void;
      saveGroups(groups: Group[]): void;

}