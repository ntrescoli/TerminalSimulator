export class Environment {
    private vars: Record<string, string>;

    constructor() {
        // Estas son tus "default_variables"
        this.vars = {
            USER: 'root',
            HOSTNAME: 'ubuntu-server',
            HOME: '/root',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin',
            SHELL: '/bin/bash',
            PWD: '/'
        };
    }

    get(key: string): string {
        return this.vars[key] || '';
    }

    set(key: string, value: string): void {
        this.vars[key] = value;
    }
}