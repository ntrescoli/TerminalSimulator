export const Errors = {
    // --- FILESYSTEM ERRORS ---
    FS: {
        NOT_FOUND: (path: string) => `bash: ${path}: No such file or directory`,
        PERMISSION_DENIED: (path: string) => `bash: ${path}: Permission denied`,
        IS_DIRECTORY: (path: string) => `bash: ${path}: Is a directory`,
        NOT_A_DIRECTORY: (path: string) => `bash: ${path}: Not a directory`,
        ALREADY_EXISTS: (path: string) => `bash: ${path}: File exists`,
        NOT_EMPTY: (path: string) => `bash: ${path}: Directory not empty`,
        INVALID_NAME: (name: string) => `bash: ${name}: invalid file name`,
        DISK_FULL: () => `bash: write error: No space left on device`,
        UNKNOWN_TYPE: (name: string) => `bash: ${name}: unknown file type`,
    },

    // --- USER / GROUP MANAGEMENT ERRORS ---
    USER: {
        NOT_FOUND: (user: string) => `useradd: user '${user}' does not exist`,
        ALREADY_EXISTS: (user: string) => `useradd: user '${user}' already exists`,
        INVALID_NAME: (user: string) => `useradd: invalid user name '${user}'`,
        UID_IN_USE: (uid: number) => `useradd: UID ${uid} is already in use`,
        CANT_REMOVE_ROOT: () => `deluser: cannot remove user 'root'`,
        AUTH_FAILED: () => `su: Authentication failure`,
    },

    GROUP: {
        NOT_FOUND: (group: string) => `addgroup: the group '${group}' does not exist`,
        ALREADY_EXISTS: (group: string) => `addgroup: the group '${group}' already exists`,
        GID_IN_USE: (gid: number) => `addgroup: the GID ${gid} is already in use`,
        PRIMARY_GROUP: (group: string) => `delgroup: cannot remove the primary group of a user '${group}'`,
    },

    // --- EXECUTION / KERNEL ERRORS ---
    SYSTEM: {
        COMMAND_NOT_FOUND: (cmd: string) => `bash: ${cmd}: command not found`,
        INVALID_ARGS: (cmd: string) => `${cmd}: invalid option or missing arguments`,
        NOT_IMPLEMENTED: (cmd: string) => `${cmd}: feature not yet implemented`,
        PIPE_ERROR: () => `bash: broken pipe`,
    }
};