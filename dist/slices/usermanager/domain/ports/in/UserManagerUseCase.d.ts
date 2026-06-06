import { Group } from '../../entities/Group';
import { User } from '../../entities/User';
export interface UserManagerUseCase {
    getUsers(): User[];
    getGroups(): Group[];
    saveUsers(users: User[]): void;
    saveGroups(groups: Group[]): void;
}
//# sourceMappingURL=UserManagerUseCase.d.ts.map