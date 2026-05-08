import { Groups } from "./groups";
import { AddUser } from "./adduser";
import { AddGroup } from "./addgroup";
import { Su } from "./su";
import { UserAdd } from "./useradd";

export const usersCmds = [
    Su,
    UserAdd,
    Groups,
    AddUser,
    AddGroup
];