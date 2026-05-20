import { Groups } from './groups';
import { AddUser } from './adduser';
import { AddGroup } from './addgroup';
import { Su } from './su';
import { UserAdd } from './useradd';
import { DelUser } from './deluser';
import { DelGroup } from './delgroup';
import { Finger } from './finger';
import { Passwd } from './passwd';

export const usersCmds = [
    Su,
    UserAdd,
    Groups,
    AddUser,
    AddGroup,
    DelUser,
    DelGroup,
    Finger,
    Passwd,
];