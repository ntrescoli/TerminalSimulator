import { ICommand } from '../../types/types';

export const Cat: ICommand = {
    name: 'cat',
    execute: ({ args, fs, hasFlag }) => {
        if (args.length < 1) return "";
        const content = fs.cat(args[0]);
        
        if (content.startsWith('cat:')) return content;

        if (hasFlag('-n')) {
            return content.split('\n')
                .map((line, i) => `${(i + 1).toString().padStart(6)}  ${line}`)
                .join('\n');
        }
        
        return content;
    }
};