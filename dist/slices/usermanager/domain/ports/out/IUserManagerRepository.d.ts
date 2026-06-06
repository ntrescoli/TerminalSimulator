import { Group } from '../../entities/Group';
import { User } from '../../entities/User';
export interface IUserManagerRepository {
    getUsers(): User[];
    getGroups(): Group[];
    saveUsers(users: User[]): void;
    saveGroups(groups: Group[]): void;
}
//# sourceMappingURL=IUserManagerRepository.d.ts.map