export const Errors = {
    NOT_FOUND: (path: string) => `bash: ${path}: No such file or directory`,
    PERMISSION_DENIED: (path: string) => `bash: ${path}: Permission denied`,
    IS_DIRECTORY: (path: string) => `bash: ${path}: Is a directory`,
    ALREADY_EXISTS: (path: string) => `bash: ${path}: File exists`,
};