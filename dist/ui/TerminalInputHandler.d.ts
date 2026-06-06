import { Kernel } from '../kernel/Kernel';
import { AuthenticationManager } from './AuthenticationManager';
import { CommandHistoryExpander } from './CommandHistoryExpander';
import { CommandHistoryNavigator } from './CommandHistoryNavigator';
import { TerminalUI } from './Terminal';
export declare class TerminalInputHandler {
    private readonly kernel;
    private readonly terminal;
    private readonly authManager;
    private readonly historyExpander;
    private readonly historyNavigator;
    private currentAbortController;
    constructor(kernel: Kernel, terminal: TerminalUI, authManager: AuthenticationManager, historyExpander: CommandHistoryExpander, historyNavigator: CommandHistoryNavigator);
    attach(inputElement: HTMLInputElement): void;
    private handleKeyDown;
    private handleEnter;
    private processResponse;
}
//# sourceMappingURL=TerminalInputHandler.d.ts.map