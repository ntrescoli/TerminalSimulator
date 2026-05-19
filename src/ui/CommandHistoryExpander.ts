export class CommandHistoryExpander {
    public expand(command: string, history: string[]): string | null {
        if (!command.startsWith('!') || command.length === 1) return null;

        const query = command.substring(1).trim();
        if (query === '!') {
            return history.length > 0 ? history[history.length - 1] : null;
        }

        if (/^\d+$/.test(query)) {
            const index = parseInt(query, 10) - 1;
            return index >= 0 && index < history.length ? history[index] : null;
        }

        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].startsWith(query)) {
                return history[i];
            }
        }

        return null;
    }
}
