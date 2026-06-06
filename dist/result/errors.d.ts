export declare const Errors: {
    FS: {
        NOT_FOUND: (path: string) => string;
        PERMISSION_DENIED: (path: string) => string;
        IS_DIRECTORY: (path: string) => string;
        NOT_A_DIRECTORY: (path: string) => string;
        ALREADY_EXISTS: (path: string) => string;
        NOT_EMPTY: (path: string) => string;
        INVALID_NAME: (name: string) => string;
        DISK_FULL: () => string;
        UNKNOWN_TYPE: (name: string) => string;
    };
    USER: {
        NOT_FOUND: (user: string) => string;
        ALREADY_EXISTS: (user: string) => string;
        INVALID_NAME: (user: string) => string;
        UID_IN_USE: (uid: number) => string;
        CANT_REMOVE_ROOT: () => string;
        AUTH_FAILED: () => string;
    };
    GROUP: {
        NOT_FOUND: (group: string) => string;
        ALREADY_EXISTS: (group: string) => string;
        GID_IN_USE: (gid: number) => string;
        PRIMARY_GROUP: (group: string) => string;
    };
    SYSTEM: {
        COMMAND_NOT_FOUND: (cmd: string) => string;
        INVALID_ARGS: (cmd: string) => string;
        NOT_IMPLEMENTED: (cmd: string) => string;
        PIPE_ERROR: () => string;
    };
};
//# sourceMappingURL=errors.d.ts.map