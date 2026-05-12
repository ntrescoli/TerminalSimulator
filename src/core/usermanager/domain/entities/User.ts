export interface User {
    username: string;
    uid: number;
    gid: number;
    home: string;
    shell: string;
    fullName?: string;
}