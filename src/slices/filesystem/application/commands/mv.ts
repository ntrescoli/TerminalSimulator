import { ICommand } from '../../../../kernel/domain/entities/Command';

export const Mv: ICommand = {
    name: 'mv',
    execute: ({ args, fs }) => {
        if (args.length < 2) {
            return args.length === 1
                ? `mv: missing destination file operand after '${args[0]}'`
                : "mv: missing file operand";
        }

        const src = args[0];
        const dest = args[1];

        const result = fs.move(src, dest);

        if (result.isFailure) {
            return result.getError();
        }

        return ""; // Silencioso en caso de éxito
    }
};