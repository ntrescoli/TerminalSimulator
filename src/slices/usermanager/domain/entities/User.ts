export interface User {
    username: string;
    password?: string;
    uid: number;
    gid: number;
    home: string;
    shell: string;
    fullName?: string;
}