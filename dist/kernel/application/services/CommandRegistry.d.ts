import { ICommand } from '../../domain/entities/Command';
export declare class CommandRegistry {
    private readonly commands;
    constructor();
    private loadCommands;
    getCommand(name: string): ICommand | undefined;
    resolveCommandName(nameOrAlias: string): string | null;
    getAllCommands(): Map<string, ICommand>;
    getCommandNames(): string[];
}
//# sourceMappingURL=CommandRegistry.d.ts.map