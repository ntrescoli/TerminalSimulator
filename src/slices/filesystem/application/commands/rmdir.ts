import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Rmdir: ICommand = {
    name: 'rmdir',
    execute: ({ args, fs }) => {
        if (args.length < 1) {
            return "rmdir: missing operand";
        }

        const errors: string[] = [];

        for (const path of args) {
            const result = fs.removeDirectory(path);
            if (result.isFailure) {
                errors.push(`rmdir: ${result.getError()}`);
            }
        }

        return errors.length > 0 ? errors.join('\n') : "";
    }
};