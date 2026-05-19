import { ICommand } from '../../domain/entities/Command';
import { commandList } from '../commands';

export class CommandRegistry {
    private commands: Map<string, ICommand> = new Map();

    constructor() {
        this.loadCommands();
    }

    private loadCommands(): void {
        commandList.forEach(cmd => {
            this.commands.set(cmd.name, cmd);
            if (cmd.alias) {
                cmd.alias.forEach(a => this.commands.set(a, cmd));
            }
        });
    }

    public getCommand(name: string): ICommand | undefined {
        return this.commands.get(name.toLowerCase());
    }

    public resolveCommandName(nameOrAlias: string): string | null {
        const cmd = this.getCommand(nameOrAlias);
        return cmd ? cmd.name : null;
    }

    public getAllCommands(): Map<string, ICommand> {
        return this.commands;
    }

    public getCommandNames(): string[] {
        return Array.from(new Set(Array.from(this.commands.values()).map(cmd => cmd.name)));
    }
}
