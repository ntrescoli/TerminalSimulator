"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = void 0;
exports.Errors = {
    // --- FILESYSTEM ERRORS ---
    FS: {
        NOT_FOUND: (path) => `bash: ${path}: No such file or directory`,
        PERMISSION_DENIED: (path) => `bash: ${path}: Permission denied`,
        IS_DIRECTORY: (path) => `bash: ${path}: Is a directory`,
        NOT_A_DIRECTORY: (path) => `bash: ${path}: Not a directory`,
        ALREADY_EXISTS: (path) => `bash: ${path}: File exists`,
        NOT_EMPTY: (path) => `bash: ${path}: Directory not empty`,
        INVALID_NAME: (name) => `bash: ${name}: invalid file name`,
        DISK_FULL: () => `bash: write error: No space left on device`,
        UNKNOWN_TYPE: (name) => `bash: ${name}: unknown file type`,
    },
    // --- USER / GROUP MANAGEMENT ERRORS ---
    USER: {
        NOT_FOUND: (user) => `useradd: user '${user}' does not exist`,
        ALREADY_EXISTS: (user) => `useradd: user '${user}' already exists`,
        INVALID_NAME: (user) => `useradd: invalid user name '${user}'`,
        UID_IN_USE: (uid) => `useradd: UID ${uid} is already in use`,
        CANT_REMOVE_ROOT: () => `deluser: cannot remove user 'root'`,
        AUTH_FAILED: () => `su: Authentication failure`,
    },
    GROUP: {
        NOT_FOUND: (group) => `addgroup: the group '${group}' does not exist`,
        ALREADY_EXISTS: (group) => `addgroup: the group '${group}' already exists`,
        GID_IN_USE: (gid) => `addgroup: the GID ${gid} is already in use`,
        PRIMARY_GROUP: (group) => `delgroup: cannot remove the primary group of a user '${group}'`,
    },
    // --- EXECUTION / KERNEL ERRORS ---
    SYSTEM: {
        COMMAND_NOT_FOUND: (cmd) => `bash: ${cmd}: command not found`,
        INVALID_ARGS: (cmd) => `${cmd}: invalid option or missing arguments`,
        NOT_IMPLEMENTED: (cmd) => `${cmd}: feature not yet implemented`,
        PIPE_ERROR: () => `bash: broken pipe`,
    }
};
