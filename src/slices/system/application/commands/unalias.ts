import type { ICommand } from '../../../../kernel/domain/entities/Command';

export const Unalias: ICommand = {
    name: 'unalias',
    valuedFlags: [],

    execute: async ({ args, env }) => {
        if (args.length < 1) {
            return 'unalias: usage: unalias name [name ...]';
        }

        for (const name of args) {
            const existed = env.removeAlias(name.trim());
            if (!existed) {
                return `unalias: ${name}: not found`;
            }
        }

        return '';
    },
};